module.exports = {
    PORT: process.env.PORT || 4000,
    NEURAL_NETWORK_PARAMS: {
        "yolov3": {
            "data": "./cfg/coco.data",
            "cfg": "./cfg/yolov3.cfg",
            "weights": "./yolov3.weights",
            "data_mask": "obj.data",
            "cfg_mask": "yolov3_mask.cfg",
            "weight_mask": "./weights/yolov3_mask_last.weights"
        }
    },
    NEURAL_NETWORK: "yolov3",
    PATH_TO_YOLO_DARKNET : "/home/hadoop/Downloads/Compressed/darknet-master",
    PATH_TO_YOLO_DARKNET_CUMULATIVE : "/home/hadoop/Desktop/darknet-master",
    PATH_TO_PYTHON_FLASK_FACE : "/home/hadoop/Downloads/Compressed/Pengenalan_muka",
    PATH_TO_PYTHON_SOCIAL_DISTANCING: "/home/hadoop/Downloads/Compressed/Social-Distancing-Analyser-COVID-19-master",
};