"""
IMPROVED Model architecture for Flood Severity Assessment.

Improvements over v1:
  - Multi-backbone support: resnet18/50, efficientnet_b0/b2, convnext_tiny
  - Feature Pyramid Network (FPN) fusing multi-scale features
  - Uncertainty estimation head (Gaussian logvar output)
  - Lightweight segmentation auxiliary head (water mask decoder)
  - GradCAM++ for sharper, more precise explainability heatmaps
"""

from typing import Tuple, Optional
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models


# ---------------------------------------------------------------------------
# Feature Pyramid Network
# ---------------------------------------------------------------------------
class FPN(nn.Module):
    """
    Lightweight 2-level Feature Pyramid Network.
    Fuses shallow (early layers) and deep (final layer) backbone features
    to capture both fine-grained water edges and coarse flooded zones.
    """
    def __init__(self, in_channels_low: int, in_channels_high: int, out_channels: int = 256):
        super().__init__()
        self.lateral_low = nn.Conv2d(in_channels_low, out_channels, 1)
        self.lateral_high = nn.Conv2d(in_channels_high, out_channels, 1)
        self.smooth = nn.Conv2d(out_channels, out_channels, 3, padding=1)

    def forward(self, feat_low: torch.Tensor, feat_high: torch.Tensor) -> torch.Tensor:
        p_high = self.lateral_high(feat_high)
        p_low = self.lateral_low(feat_low)
        p_high_up = F.interpolate(p_high, size=p_low.shape[-2:], mode="nearest")
        return self.smooth(p_low + p_high_up)


# ---------------------------------------------------------------------------
# Water Mask Auxiliary Decoder
# ---------------------------------------------------------------------------
class WaterMaskDecoder(nn.Module):
    """
    Lightweight segmentation head that explicitly predicts a binary water mask.
    Forces the model to learn WHERE the water is, not just correlate scene statistics.
    Trained with optional binary water mask supervision (if provided in dataset).
    """
    def __init__(self, in_channels: int = 256):
        super().__init__()
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(in_channels, 128, 2, stride=2),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(128, 64, 2, stride=2),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 1, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.decoder(x)  # (B, 1, H', W')


# ---------------------------------------------------------------------------
# Main FloodSeverityNet v2
# ---------------------------------------------------------------------------
class FloodSeverityNet(nn.Module):
    """
    Flood Severity Neural Network v2.

    Predicts:
      1. Overall Severity Score (continuous 0.0 - 10.0)
      2. Prediction Uncertainty (log-variance for Gaussian output)
      3. Feature Attributes: water_depth, vehicle_risk, structural_risk
      4. Water Mask (auxiliary segmentation output, optional)

    Backbones supported:
      - resnet18, resnet50 (v1 compat)
      - efficientnet_b0, efficientnet_b2 (NEW)
      - convnext_tiny (NEW)
    """
    BACKBONE_CONFIGS = {
        "resnet18":        {"low_ch": 128, "high_ch": 512},
        "resnet50":        {"low_ch": 512, "high_ch": 2048},
        "efficientnet_b0": {"low_ch": 40,  "high_ch": 1280},
        "efficientnet_b2": {"low_ch": 48,  "high_ch": 1408},
        "convnext_tiny":   {"low_ch": 192, "high_ch": 768},
    }

    def __init__(
        self,
        backbone_name: str = "efficientnet_b2",
        pretrained: bool = True,
        dropout_rate: float = 0.3,
        use_fpn: bool = True,
        use_seg_head: bool = True,
    ):
        super().__init__()
        self.backbone_name = backbone_name
        self.use_fpn = use_fpn
        self.use_seg_head = use_seg_head

        # ── Backbone ──────────────────────────────────────────────────────────
        if backbone_name == "resnet18":
            weights = models.ResNet18_Weights.DEFAULT if pretrained else None
            base = models.resnet18(weights=weights)
            layers = list(base.children())
            self.stem = nn.Sequential(*layers[:6])   # up to layer2
            self.layer3 = layers[6]
            self.layer4 = layers[7]
            self.target_layer = self.layer4
            fpn_low, fpn_high = 128, 512

        elif backbone_name == "resnet50":
            weights = models.ResNet50_Weights.DEFAULT if pretrained else None
            base = models.resnet50(weights=weights)
            layers = list(base.children())
            self.stem = nn.Sequential(*layers[:6])
            self.layer3 = layers[6]
            self.layer4 = layers[7]
            self.target_layer = self.layer4
            fpn_low, fpn_high = 512, 2048

        elif backbone_name == "efficientnet_b0":
            weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
            base = models.efficientnet_b0(weights=weights)
            self.stem = nn.Sequential(*list(base.features[:4]))   # out: 40ch
            self.layer3 = base.features[4]
            self.layer4 = nn.Sequential(*list(base.features[5:]))  # out: 1280ch
            self.target_layer = self.layer4
            fpn_low, fpn_high = 40, 1280

        elif backbone_name == "efficientnet_b2":
            weights = models.EfficientNet_B2_Weights.DEFAULT if pretrained else None
            base = models.efficientnet_b2(weights=weights)
            self.stem = nn.Sequential(*list(base.features[:4]))   # out: 48ch at 28x28
            self.layer3 = base.features[4]                        # out: 88ch
            self.layer4 = nn.Sequential(*list(base.features[5:])) # out: 1408ch
            self.target_layer = self.layer4
            fpn_low, fpn_high = 48, 1408

        elif backbone_name == "convnext_tiny":
            weights = models.ConvNeXt_Tiny_Weights.DEFAULT if pretrained else None
            base = models.convnext_tiny(weights=weights)
            stages = list(base.features.children())
            self.stem = nn.Sequential(*stages[:4])
            self.layer3 = stages[4]
            self.layer4 = nn.Sequential(*stages[5:])
            self.target_layer = self.layer4
            fpn_low, fpn_high = 192, 768

        else:
            raise ValueError(
                f"Unsupported backbone: {backbone_name}. "
                f"Choose from: {list(self.BACKBONE_CONFIGS.keys())}"
            )

        self.global_pool = nn.AdaptiveAvgPool2d((1, 1))

        # ── FPN ───────────────────────────────────────────────────────────────
        fpn_out = 256
        if use_fpn:
            self.fpn = FPN(in_channels_low=fpn_low, in_channels_high=fpn_high, out_channels=fpn_out)
            shared_in = fpn_out
        else:
            shared_in = fpn_high

        # ── Shared FC ─────────────────────────────────────────────────────────
        self.shared_fc = nn.Sequential(
            nn.Linear(shared_in, 256),
            nn.LayerNorm(256),
            nn.GELU(),
            nn.Dropout(p=dropout_rate),
            nn.Linear(256, 128),
            nn.LayerNorm(128),
            nn.GELU(),
        )

        # ── Severity Head: score + log-variance ──────────────────────────────
        self.severity_head = nn.Linear(128, 1)
        self.severity_logvar = nn.Linear(128, 1)  # uncertainty estimation

        # ── Feature Attribute Heads ───────────────────────────────────────────
        self.attributes_head = nn.Linear(128, 3)

        # ── Segmentation Head (water mask) ────────────────────────────────────
        if use_seg_head and use_fpn:
            self.seg_head = WaterMaskDecoder(in_channels=fpn_out)
        else:
            self.seg_head = None

        # ── Grad-CAM++ storage ────────────────────────────────────────────────
        self.gradient = None
        self.activations = None

    # ── Hook callbacks ─────────────────────────────────────────────────────────
    def _save_activations(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradient = grad_output[0]

    def register_cam_hooks(self):
        """Registers forward/backward hooks for GradCAM++."""
        self.target_layer.register_forward_hook(self._save_activations)
        self.target_layer.register_full_backward_hook(self._save_gradient)

    # ── Feature extraction ────────────────────────────────────────────────────
    def _extract_backbone(self, x: torch.Tensor):
        feat_low = self.stem(x)
        feat_mid = self.layer3(feat_low)
        feat_high = self.layer4(feat_mid)
        return feat_low, feat_high

    def _pool_and_project(self, feat_low, feat_high):
        if self.use_fpn:
            fused = self.fpn(feat_low, feat_high)
        else:
            fused = feat_high
        self._fpn_output = fused  # store for seg head
        pooled = self.global_pool(fused)
        flat = torch.flatten(pooled, 1)
        return self.shared_fc(flat)

    # ── Forward ───────────────────────────────────────────────────────────────
    def forward(
        self, x: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, Optional[torch.Tensor]]:
        """
        Returns:
          severity_score: (B,)       bounded [0, 10]
          severity_logvar: (B,)      log-variance of score (uncertainty)
          attributes: (B, 3)         [water_depth, vehicle_risk, structural_risk] bounded [0, 10]
          water_mask: (B, 1, H, W)   optional segmentation output (or None)
        """
        feat_low, feat_high = self._extract_backbone(x)
        features = self._pool_and_project(feat_low, feat_high)

        severity_score = torch.sigmoid(self.severity_head(features)).squeeze(-1) * 10.0
        severity_logvar = self.severity_logvar(features).squeeze(-1)
        attributes = torch.sigmoid(self.attributes_head(features)) * 10.0

        water_mask = None
        if self.seg_head is not None and hasattr(self, "_fpn_output"):
            water_mask = self.seg_head(self._fpn_output)

        return severity_score, severity_logvar, attributes, water_mask

    # ── GradCAM++ ─────────────────────────────────────────────────────────────
    def compute_gradcam_pp(self, x: torch.Tensor) -> Tuple[float, float, np.ndarray, np.ndarray]:
        """
        Computes severity + uncertainty + GradCAM++ heatmap for a single image tensor (1, 3, H, W).

        GradCAM++ uses second-order gradients to produce sharper,
        better-localized heatmaps than standard GradCAM.

        Returns:
            severity (float): score 0.0 - 10.0
            uncertainty (float): ±std of the score
            attributes (np.ndarray): [water_depth, vehicle_risk, structural_risk]
            cam_heatmap (np.ndarray): 2D heatmap normalized to [0, 1]
        """
        self.eval()
        x = x.requires_grad_(True)

        feat_low, feat_high = self._extract_backbone(x)
        features = self._pool_and_project(feat_low, feat_high)

        score_logit = self.severity_head(features)
        logvar = self.severity_logvar(features).squeeze(-1)
        severity = torch.sigmoid(score_logit).item() * 10.0
        uncertainty = float(torch.exp(0.5 * logvar).item())
        attrs = (torch.sigmoid(self.attributes_head(features)) * 10.0).detach().cpu().numpy()[0]

        # GradCAM++ backward pass
        self.zero_grad()
        score_logit.sum().backward(retain_graph=False)

        grads = self.gradient        # (1, C, H, W)
        acts = self.activations      # (1, C, H, W)

        # Second-order gradient weights (GradCAM++ formula)
        grads_sq = grads ** 2
        grads_cu = grads ** 3
        sum_acts = acts.sum(dim=(2, 3), keepdim=True)
        alpha = grads_sq / (2.0 * grads_sq + sum_acts * grads_cu + 1e-8)
        weights = (alpha * F.relu(score_logit.detach())).sum(dim=(2, 3), keepdim=True)

        cam = (weights * acts).sum(dim=1).squeeze()
        cam = F.relu(cam)
        cam_np = cam.detach().cpu().numpy()

        if cam_np.max() > 0:
            cam_np = (cam_np - cam_np.min()) / (cam_np.max() - cam_np.min() + 1e-8)
        else:
            cam_np = np.zeros_like(cam_np)

        return severity, uncertainty, attrs, cam_np


# ---------------------------------------------------------------------------
# Ensemble wrapper
# ---------------------------------------------------------------------------
class FloodEnsemble(nn.Module):
    """
    Ensemble of multiple FloodSeverityNet backbones.
    Averages severity scores, propagates combined uncertainty,
    and uses the first model's GradCAM++ for visualization.
    """
    def __init__(self, models_list: list):
        super().__init__()
        self.models = nn.ModuleList(models_list)

    def forward(self, x: torch.Tensor):
        all_scores, all_logvars, all_attrs = [], [], []
        for m in self.models:
            s, lv, a, _ = m(x)
            all_scores.append(s)
            all_logvars.append(lv)
            all_attrs.append(a)

        severity = torch.stack(all_scores).mean(0)
        logvar = torch.stack(all_logvars).mean(0)
        attributes = torch.stack(all_attrs).mean(0)
        return severity, logvar, attributes, None

    def compute_gradcam_pp(self, x: torch.Tensor):
        """Uses first model for visualization, averages predictions."""
        sev, unc, attrs, cam = self.models[0].compute_gradcam_pp(x)
        # Average all model scores for robustness
        extra_scores = []
        for m in self.models[1:]:
            s, _, _, _ = m(x.detach())
            extra_scores.append(s.item())
        if extra_scores:
            sev = (sev + sum(extra_scores)) / (1 + len(extra_scores))
        return sev, unc, attrs, cam
