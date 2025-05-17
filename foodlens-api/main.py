from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import io
import onnxruntime as ort
import uvicorn
import os
from auth import router as auth_router  # Import authentication routes
from recipes import router as recipe_router

# Initialize FastAPI
app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
app.include_router(auth_router)
app.include_router(recipe_router)


# Class labels (in correct order)
CLASS_NAMES = ["bean", "bitter gourd", "bottle gourd", "broccoli", "cabbage"]

# Load the ONNX model once
session = ort.InferenceSession("best.onnx")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image = image.resize((224, 224))
        img_np = np.array(image).astype(np.float32) / 255.0
        img_np = np.transpose(img_np, (2, 0, 1))[np.newaxis, :]

        input_name = session.get_inputs()[0].name
        output = session.run(None, {input_name: img_np})[0]
        output = np.squeeze(output)

        results = []
        for det in output:
            det = np.squeeze(det)
            if len(det) < 6:
                continue

            x1, y1, x2, y2, conf, class_id = map(float, det[:6])
            class_id = int(class_id)

            if conf > 0.8 and 0 <= class_id < len(CLASS_NAMES):
                results.append({
                    "class": CLASS_NAMES[class_id],
                    "confidence": round(conf, 3),
                    "bbox": [
                        max(0, min(224, round(x1))),
                        max(0, min(224, round(y1))),
                        max(0, min(224, round(x2))),
                        max(0, min(224, round(y2)))
                    ]
                })

        return JSONResponse(content={"detections": results})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
