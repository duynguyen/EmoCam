#include "emoRecognizer.h"


using namespace std;
using namespace cv;

//constructor
emoRecognizer::emoRecognizer()
{
    cout << "[Emotion Recognizer] Setup the facial emotion recognizer..." << endl;

    //manually input the path to pre-trained model and emotion recognization method
    pathToModel = "../input/database/model/emoRecog.xml";

    //    "FaceRecognizer.Eigenfaces":  Eigenfaces, also referred to as PCA (Turk and Pentland, 1991).
    //    "FaceRecognizer.Fisherfaces": Fisherfaces, also referred to as LDA (Belhumeur et al, 1997).
    //    "FaceRecognizer.LBPH":        Local Binary Pattern Histograms (Ahonen et al, 2006).
    emoRecMethod = "FaceRecognizer.Fisherfaces";

    bool haveContribModule = cv::initModule_contrib();
    if (!haveContribModule) {
        cerr << "ERROR: The 'contrib' module is needed for FaceRecognizer but has not been loaded into OpenCV!" << endl;
        exit(1);
    }

    emoModel = cv::Algorithm::create<FaceRecognizer>(emoRecMethod);
    if (emoModel.empty()) {
        cerr << "[Emotion Recognizer] ERROR: The FaceRecognizer algorithm [" << emoRecMethod << "] is not available in your version of OpenCV. Please update to OpenCV v2.4.1 or newer." << endl;
        exit(1);
    }

    //load the model
    emoModel->load(pathToModel);
    if(emoModel.empty()){
        cerr << "[Emotion Recognizer] Cannot load the model in path " << pathToModel << endl;
        exit(1);
    }

    //set default face size
    defaultFaceSize = cv::Size(120,120);
}

//Main routine for detecting and recognizing the emotional state of each face detected in the current frame
void emoRecognizer::process(const cv::Mat curFrame, std::vector<emoFace>& facePos, long timeStamp)
{
    //loop over all detected facial regions in current frame to recognize emotion
    std::vector<emoFace>::iterator iter = facePos.begin();
    while(iter!=facePos.end()){
        emoFace& curFace = (*iter);

        //extract the the face ROI only
        Mat faceROI = curFrame(curFace.boundingBox);

        //if the image is color, convert it to gray
        Mat faceROI_gray;
        if (faceROI.channels() != 1){
            cv::cvtColor(faceROI, faceROI_gray, CV_BGR2GRAY);
        } else
            cv::copy(faceROI, faceROI_gray);

        //perform various image processing techniques to standardize the face region
        imgProcessor.run(faceROI_gray, curFace.leftEye, curFace.rightEye, defaultFaceSize);

        //now perform predict upon the pre-processed gray image
        curFace.emotion = emoModel->predict(faceROI_gray);
        iter++;
    }
}


