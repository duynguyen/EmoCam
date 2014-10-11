#include "facepreprocesser.h"

using namespace std;
using namespace cv;

facePreProcessor::facePreProcessor()
{
}

//load models
bool facePreProcessor::loadModel(const std::string& faceModel, const std::string& eyeModel, const cv::Size defaultSize)
{
    if( !faceCascade.load( faceModel) ){
        cout << "--(!)Error loading " << faceModel << endl;
        return false;
    }

    if( !eyeCascade.load( eyeModel ) ){
        cout << "--(!)Error loading " << eyeModel << endl;
        return false;
    }

    faceSize = defaultSize;

    return true;
}

bool facePreProcessor::run(const Mat &curImg, cv::Mat& processedFace)
{
    //first detect face and eye
    if (!detectFaceAndEye(curImg, faceROI, eyes))
        return false;

    enhanceImgQuality(faceROI, eyes);

    processedFace = faceROI.clone();

    return true;
}

void facePreProcessor::enhanceImgQuality(cv::Mat& faceImg, std::vector<cv::Rect>& eyeRegions)
{
    //some parameters needed
    const double DESIRED_LEFT_EYE_X = 0.16;     // Controls how much of the face is visible after preprocessing.
    const double DESIRED_LEFT_EYE_Y = 0.14;
    const double FACE_ELLIPSE_CY = 0.40;
    const double FACE_ELLIPSE_W = 0.50;         // Should be atleast 0.5
    const double FACE_ELLIPSE_H = 0.80;         // Controls how tall the face mask is.
    int desiredFaceWidth = faceSize.width;
    int desiredFaceHeight = faceSize.height;

    //find position of left eye and right eye
    Point2f leftEye, rightEye;
    if (eyeRegions[0].x < eyeRegions[1].x){
        leftEye = Point2f(eyeRegions[0].x+eyeRegions[0].width/2,eyeRegions[0].y+eyeRegions[0].height/2);
        rightEye = Point2f(eyeRegions[1].x+eyeRegions[1].width/2,eyeRegions[1].y+eyeRegions[1].height/2);
    } else {
        leftEye = Point2f(eyeRegions[1].x+eyeRegions[1].width/2,eyeRegions[1].y+eyeRegions[1].height/2);
        rightEye = Point2f(eyeRegions[0].x+eyeRegions[0].width/2,eyeRegions[0].y+eyeRegions[0].height/2);
    }

    // Get the center between the 2 eye
    Point2f eyesCenter = Point2f( (leftEye.x + rightEye.x) * 0.5f, (leftEye.y + rightEye.y) * 0.5f );
    // Get the angle between the 2 eyes.
    double dy = (rightEye.y - leftEye.y);
    double dx = (rightEye.x - leftEye.x);
    double len = sqrt(dx*dx + dy*dy);
    double angle = atan2(dy, dx) * 180.0/CV_PI; // Convert from radians to degrees.

    // Hand measurements shown that the left eye center should ideally be at roughly (0.19, 0.14) of a scaled face image.
    const double DESIRED_RIGHT_EYE_X = (1.0f - DESIRED_LEFT_EYE_X);
    // Get the amount we need to scale the image to be the desired fixed size we want.
    double desiredLen = (DESIRED_RIGHT_EYE_X - DESIRED_LEFT_EYE_X) * desiredFaceWidth;
    double scale = desiredLen / len;
    // Get the transformation matrix for rotating and scaling the face to the desired angle & size.
    Mat rot_mat = getRotationMatrix2D(eyesCenter, angle, scale);
    // Shift the center of the eyes to be the desired center between the eyes.
    rot_mat.at<double>(0, 2) += desiredFaceWidth * 0.5f - eyesCenter.x;
    rot_mat.at<double>(1, 2) += desiredFaceHeight * DESIRED_LEFT_EYE_Y - eyesCenter.y;

    // Rotate and scale and translate the image to the desired angle & size & position!
    // Note that we use 'w' for the height instead of 'h', because the input face has 1:1 aspect ratio.
    Mat warped = Mat(desiredFaceHeight, desiredFaceWidth, CV_8U, Scalar(128)); // Clear the output image to a default grey.
    cv::warpAffine(faceImg, warped, rot_mat, warped.size());

    //perform histogram equalization on two sides
    equalizeLeftAndRightHalves(warped);

    //partiall smooth the image with bilateral filter
    Mat filtered = Mat(warped.size(), CV_8U);
    bilateralFilter(warped, filtered, 0, 20.0, 2.0);

    // Filter out the corners of the face, since we mainly just care about the middle parts.
    // Draw a filled ellipse in the middle of the face-sized image.
    Mat mask = Mat(warped.size(), CV_8U, Scalar(0)); // Start with an empty mask.
    Point faceCenter = Point( desiredFaceWidth/2, cvRound(desiredFaceHeight * FACE_ELLIPSE_CY) );
    Size size = Size( cvRound(desiredFaceWidth * FACE_ELLIPSE_W), cvRound(desiredFaceHeight * FACE_ELLIPSE_H) );
    ellipse(mask, faceCenter, size, 0, 0, 360, Scalar(255), CV_FILLED);
    //imshow("mask", mask);

    // Use the mask, to remove outside pixels.
    Mat dstImg = Mat(warped.size(), CV_8U, Scalar(128)); // Clear the output image to a default gray.

    // Apply the elliptical mask on the face.
    filtered.copyTo(dstImg, mask);  // Copies non-masked pixels from filtered to dstImg.

    cv::swap(faceImg, dstImg);
}

void facePreProcessor::equalizeLeftAndRightHalves(cv::Mat& faceImg)
{
    int w = faceImg.cols;
    int h = faceImg.rows;

    // 1) First, equalize the whole face.
    Mat wholeFace;
    equalizeHist(faceImg, wholeFace);

    // 2) Equalize the left half and the right half of the face separately.
    int midX = w/2;
    Mat leftSide = faceImg(Rect(0,0, midX,h));
    Mat rightSide = faceImg(Rect(midX,0, w-midX,h));
    equalizeHist(leftSide, leftSide);
    equalizeHist(rightSide, rightSide);

    // 3) Combine the left half and right half and whole face together, so that it has a smooth transition.
    for (int y=0; y<h; y++) {
        for (int x=0; x<w; x++) {
            int v;
            if (x < w/4) {          // Left 25%: just use the left face.
                v = leftSide.at<uchar>(y,x);
            }
            else if (x < w*2/4) {   // Mid-left 25%: blend the left face & whole face.
                int lv = leftSide.at<uchar>(y,x);
                int wv = wholeFace.at<uchar>(y,x);
                // Blend more of the whole face as it moves further right along the face.
                float f = (x - w*1/4) / (float)(w*0.25f);
                v = cvRound((1.0f - f) * lv + (f) * wv);
            }
            else if (x < w*3/4) {   // Mid-right 25%: blend the right face & whole face.
                int rv = rightSide.at<uchar>(y,x-midX);
                int wv = wholeFace.at<uchar>(y,x);
                // Blend more of the right-side face as it moves further right along the face.
                float f = (x - w*2/4) / (float)(w*0.25f);
                v = cvRound((1.0f - f) * wv + (f) * rv);
            }
            else {                  // Right 25%: just use the right face.
                v = rightSide.at<uchar>(y,x-midX);
            }
            faceImg.at<uchar>(y,x) = v;
        }// end x loop
    }//end y loop
}

bool facePreProcessor::detectFaceAndEye(const Mat &curImg, Mat& faceRegion, vector<Rect>& eyeRegions)
{
    //first perform histogram equalization on the image
    Mat equalizedImg;
    cv::equalizeHist(curImg, equalizedImg);

    //parameters for finding eyes and face
    // Only search for just 1 object (the biggest in the image).
    int flags = 0|CV_HAAR_SCALE_IMAGE;
    // Smallest object size.
    Size minFeatureSize = Size(20, 20);
    // How detailed should the search be. Must be larger than 1.0.
    float searchScaleFactor = 1.1f;
    // How much the detections should be filtered out. This should depend on how bad false detections are to your system.
    // minNeighbors=2 means lots of good+bad detections, and minNeighbors=6 means only good detections are given but some are missed.
    int minNeighbors = 4;

    vector<cv::Rect> objects;

    // Detect objects in the small grayscale image.
    faceCascade.detectMultiScale(equalizedImg, objects, searchScaleFactor, minNeighbors, flags, minFeatureSize);

    //only one face in a image
    if (objects.size() != 1)
        return false;
    //detect the eye and visualize the result
    for (int i=0; i < objects.size(); i++){
        //cv::rectangle(equalizedImg, objects[i], cv::Scalar(255), 1,8,0);

        //detect eye on the face region only
        faceRegion = equalizedImg( objects[i] ).clone();

        eyeCascade.detectMultiScale( faceRegion, eyeRegions,  searchScaleFactor, minNeighbors, flags, minFeatureSize);

        //visualize the eyes
//        for(int j=0; j<eyeRegions.size(); j++){
//            cv::rectangle(faceRegion, eyeRegions[j],cv::Scalar(255), 1,8,0);
//        }

//        cv::imshow("test",faceRegion);
//        cv::waitKey(0);
        //hiep For now if there are more or less than two eyes are detected, better discard the image since
        //it can bring mistake to training
        if (eyeRegions.size()!=2)
            return false;
    }

    return true;
}
