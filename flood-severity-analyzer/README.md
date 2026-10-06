# 🌊 Flood Severity Assessment & Explainability AI

An end-to-end Computer Vision & Deep Learning pipeline that analyzes flood images (street-level, civilian, or aerial) and predicts an **Overall Severity Score (0.0 to 10.0)** along with physical hazard feature attributes and **Grad-CAM visual heatmaps**.

---

## 📌 Severity Scoring Framework (Out of 10.0)

| Score Range | Hazard Tier | Visual Physical Characteristics | Action / Advisory |
| :--- | :--- | :--- | :--- |
| **0.0 – 2.5** | **Low / Minor** | Puddles on asphalt, minor curb ponding, walkable | Normal transit; monitor drains |
| **2.6 – 5.0** | **Moderate** | Shin-deep water, street impassable for sedans, curb submerged | Avoid low-lying roads |
| **5.1 – 7.5** | **High / Severe** | Knee-to-waist deep water, vehicles submerged up to hoods, ground floor flooded | Evacuate ground levels; alert emergency teams |
| **7.6 – 10.0** | **Extreme / Catastrophic** | Roof-level inundation, swift torrential currents, structural collapse danger | Immediate emergency rescue & evacuation |

---

## 🏗️ Architecture & Features

- **Backbone Network**: Transfer learning with PyTorch vision backbones (`ResNet-18`, `ResNet-50`, or `EfficientNet-B0`).
- **Hardware Acceleration**: Automatic **Apple Silicon MPS (Metal Performance Shaders)** GPU acceleration for fast local training on Mac M-series chips.
- **Bounded Multi-Task Heads**:
  - `Severity Head`: Outputs continuous score in `[0.0, 10.0]` via bounded sigmoid projection.
  - `Attribute Heads`: Predicts **Water Depth / Extent**, **Vehicle Submersion Risk**, and **Structural Hazard Risk**.
- **Visual Explainability (Grad-CAM)**: Generates spatial activation heatmaps showing exactly which flooded objects / regions led the model to assign the severity score.
- **Interactive UI**: Gradio web app with image drag-and-drop, real-time scoring gauge, and heatmap overlay.

---

## 🔌 Spring Boot Integration (VictimService API)

Start the REST API microservice:
```bash
uvicorn src.api:app --host 0.0.0.0 --port 8000
```
- **Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Endpoint**: `POST /api/v1/flood/score`
- **Request**: `FloodScoreRequestDTO` (`image_base64`)
- **Response**: `FloodScoreResponseDTO` (matches `FloodReport` MongoDB document schema)

---

## 🚀 Quickstart Guide


### 1. Activate Environment
```bash
cd /Users/harnimarpreetsingh/Documents/flood-severity-analyzer
source .venv/bin/activate
```

### 2. Prepare / Generate Dataset
Generate a balanced multi-tier benchmark dataset:
```bash
python3 src/generate_sample_data.py --output-dir data --num-samples 150
```

*(Optional)* Download real-world disaster sample images:
```bash
python3 src/download_dataset.py --output-dir data
```

### 3. Train the Model
Train on your Mac with MPS GPU acceleration:
```bash
python3 src/train.py \
  --data-csv data/annotations.csv \
  --img-dir data \
  --backbone resnet18 \
  --epochs 12 \
  --batch-size 16 \
  --lr 2e-4 \
  --output-dir checkpoints
```
Training logs the Huber loss, Validation MAE (out of 10.0), tier accuracy, and generates `checkpoints/training_curves.png`.

### 4. Run CLI Inference (PyTorch + GradCAM++)
```bash
python3 src/infer.py \
  --image data/real_images/real_ext_torrent_disaster.jpg \
  --checkpoint checkpoints_v2/best_model.pth \
  --save-viz outputs/cam_result.png
```

### 5. Export & Run Ultra-Fast Edge ONNX Inference (30ms / 33 FPS)
```bash
# Export PyTorch model to standalone ONNX
python3 src/export_onnx.py --checkpoint checkpoints_v2/best_model.pth --output checkpoints_v2/flood_severity_net.onnx

# Run edge inference with zero PyTorch dependencies
python3 src/infer_onnx.py --image data/real_images/real_ext_torrent_disaster.jpg
```

### 6. Launch the Interactive Web Platform (3 Tabs)
```bash
python3 src/app.py
```
Open **http://127.0.0.1:7860** in your browser to access:
- **Single-Image Deep Assessment** (GradCAM++, Uncertainty, Features)
- **Temporal Differential Mode** (Dry baseline vs flooded scene change detection)
- **ONNX Edge Benchmark** (Real-time FPS and latency measurement)

---

## 📂 Project Structure

```text
flood-severity-analyzer/
├── data/
│   ├── images/                       # Synthetic multi-tier image dataset
│   ├── real_images/                  # Curated real-world disaster flood photos
│   └── annotations_combined.csv      # Unified annotations
├── checkpoints_v2/
│   ├── best_model.pth                # Trained EfficientNet-B2 + FPN checkpoint
│   ├── calibration.pkl               # Isotonic regression calibrator
│   ├── flood_severity_net.onnx       # Standalone ONNX model (33.4 MB)
│   └── training_curves.png           # Multi-task loss and MAE plots
├── src/
│   ├── model.py                      # EfficientNet-B2/ConvNeXt, FPN, GradCAM++
│   ├── dataset.py                    # Flood augmentations & balanced sampler
│   ├── train.py                      # Multi-task training engine (Huber, Ranking, NLL)
│   ├── infer.py                      # PyTorch inference with TTA & GradCAM++
│   ├── export_onnx.py                # ONNX exporter with validation
│   ├── infer_onnx.py                 # Ultra-fast CPU edge inference (30ms / 33 FPS)
│   ├── differential.py               # Temporal baseline vs flood change detection
│   ├── calibrate.py                  # Score calibrator
│   └── app.py                        # 3-Tab unified Gradio web platform
├── requirements.txt
└── README.md
```

---

## 🏷️ Using Your Own Dataset
To train on your own flood images, simply format a CSV file `my_dataset.csv` with the columns:
```csv
image_path,severity_score,water_depth,vehicle_risk,structural_risk
images/flood_01.jpg,3.5,3.2,2.0,0.5
images/flood_02.jpg,8.2,8.0,9.0,7.5
```
*(If feature columns like `water_depth` are omitted, the dataset loader will automatically estimate them from the severity score).*
