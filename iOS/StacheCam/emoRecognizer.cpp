#include "emoRecognizer.h"


using namespace std;
using namespace cv;

//constructor
emoRecognizer::emoRecognizer()
{
    cout << "[Emotion Recognizer] Setup the facial emotion recognizer..." << endl;

    //manually input the path to pre-trained model and emotion recognization method
    CFBundleRef mainBundle = CFBundleGetMainBundle();
    CFURLRef modelURL = CFBundleCopyResourceURL(mainBundle, CFSTR("model3"), CFSTR("xml"), NULL);
    CFStringRef modelPath = CFURLCopyFileSystemPath(modelURL, kCFURLPOSIXPathStyle);
    CFStringEncoding encodingMethod = CFStringGetSystemEncoding();
    const char *path = CFStringGetCStringPtr(modelPath, encodingMethod);
    pathToModel = path;

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
    
    //modify the coordinate of face
    float ratio = 0.8;
    float ratio_half = (1.0 - ratio)/2.0;
    //loop over all detected facial regions in current frame to recognize emotion
    std::vector<emoFace>::iterator iter = facePos.begin();
    while(iter!=facePos.end()){
        emoFace& curFace = (*iter);
        
        cv::Rect newBox = cv::Rect(float(curFace.boundingBox.x)+ ratio_half*float(curFace.boundingBox.width),
                                   float(curFace.boundingBox.y)+ ratio_half*float(curFace.boundingBox.height),
                                   float(curFace.boundingBox.width)*ratio,
                                   float(curFace.boundingBox.height)*ratio
                                   );
        curFace.boundingBox = newBox;
        
        curFace.leftEye = Point2f(curFace.leftEye.x - curFace.boundingBox.x,curFace.leftEye.y - curFace.boundingBox.y );
        curFace.rightEye = Point2f(curFace.rightEye.x - curFace.boundingBox.x,curFace.rightEye.y - curFace.boundingBox.y );
        
        
        //extract the the face ROI only
        Mat faceROI = curFrame(curFace.boundingBox);
        
        //if the image is color, convert it to gray
        Mat faceROI_gray;
        if (faceROI.channels() != 1){
            cv::cvtColor(faceROI, faceROI_gray, CV_BGR2GRAY);
        } else
            faceROI.copyTo(faceROI_gray);
        
        //perform various image processing techniques to standardize the face region
        imgProcessor.run(faceROI_gray, curFace.leftEye, curFace.rightEye, defaultFaceSize);
        
        //        cv::imshow("FACE", faceROI_gray);
        //        waitKey(0);
        //now perform predict upon the pre-processed gray image
        curFace.emotion = emoModel->predict(faceROI_gray);
        iter++;
    }
}

