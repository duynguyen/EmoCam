#include "facetrainer.h"
#include <stdio.h>

using namespace std;
using namespace cv;

faceTrainer::faceTrainer(const std::string facerecAlgorithm)
{
    cout << "[Face Recognizer] Setup the facial emotion recognizer..." << endl;

    bool haveContribModule = cv::initModule_contrib();
    if (!haveContribModule) {
        cerr << "ERROR: The 'contrib' module is needed for FaceRecognizer but has not been loaded into OpenCV!" << endl;
        exit(1);
    }
    model = cv::Algorithm::create<FaceRecognizer>(facerecAlgorithm);
    if (model.empty()) {
        cerr << "[Face Recognizer] ERROR: The FaceRecognizer algorithm [" << facerecAlgorithm << "] is not available in your version of OpenCV. Please update to OpenCV v2.4.1 or newer." << endl;
        exit(1);
    }
}

void faceTrainer::trainModel(std::vector<cv::Mat>& sample, std::vector<int> label)
{
    model->train(sample, label);
}

void faceTrainer::saveModel(const std::string modelName)
{
    model->save(modelName);
}

Mat faceTrainer::getImageFrom1DFloatMat(const Mat matrixRow, int height)
{
    // Make it a rectangular shaped image instead of a single row.
    Mat rectangularMat = matrixRow.reshape(1, height);
    // Scale the values to be between 0 to 255 and store them as a regular 8-bit uchar image.
    Mat dst;
    normalize(rectangularMat, dst, 0, 255, NORM_MINMAX, CV_8UC1);
    return dst;
}

// Print the label and then contents of a cv::Mat from the C++ interface (using "LOG()") for easy debugging.
// If 'maxElements' is 0, it will print the whole array. If it is -1, it will not print the array at all.
void faceTrainer::printMat(const cv::Mat M, const char *label, int maxElements)
{
    string s;
    char buff[32];
    if (label)
        s = label + string(": ");
    else
        s = "Mat: ";
    if (!M.empty()) {
        int channels = CV_MAT_CN(M.type());
        int depth_bpp = getBitDepth(M);     // eg: 8, 16, 32.
        int depth_type = CV_MAT_DEPTH(M.type());    // eg: CV_32S, CV_32F

        // Show the dimensions & data type
        sprintf(buff, "%dw%dh %dch %dbpp", M.cols, M.rows, channels, depth_bpp);
        s += string(buff);

        // Show the data range for each channel
        s += ", range";
        for (int ch=0; ch<channels; ch++) {
            cv::Mat arr = cv::Mat(M.rows, M.cols, depth_type);
            // Extract one channel at a time, to show it's range.
            int from_to[2];
            from_to[0] = ch;
            from_to[1] = 0;
            cv::mixChannels( &M, 1, &arr, 1, from_to, 1 );
            // Show it's range.
            double minVal, maxVal;
            cv::minMaxLoc(arr, &minVal, &maxVal);
            snprintf(buff, sizeof(buff), "[%lg,%lg]", minVal, maxVal);
            s += buff;
        }
        cout << s << endl;

        // Show the actual data values
        //printArray2D(M.data, M.cols, M.rows, channels, depth_type, M.step, maxElements);
    }
    else {
        cout << s << " empty Mat" << endl;
        //LOG("%s empty Mat", s.c_str());
    }
}

void faceTrainer::printMatInfo(const cv::Mat M, const char *label)
{
    printMat(M, label, -1);
}


void faceTrainer::showTrainingDebugData(const int faceWidth, const int faceHeight)
{
    try {   // Surround the OpenCV calls by a try/catch block so we don't crash if some model parameters aren't available.

        // Show the average face (statistical average for each pixel in the collected images).
        Mat averageFaceRow = model->get<Mat>("mean");
        printMatInfo(averageFaceRow, "averageFaceRow");
        // Convert the matrix row (1D float matrix) to a regular 8-bit image.
        Mat averageFace = getImageFrom1DFloatMat(averageFaceRow, faceHeight);
        printMatInfo(averageFace, "averageFace");
        imshow("averageFace", averageFace);

        // Get the eigenvectors
        Mat eigenvectors = model->get<Mat>("eigenvectors");
        printMatInfo(eigenvectors, "eigenvectors");

        // Show the best 20 eigenfaces
        for (int i = 0; i < min(20, eigenvectors.cols); i++) {
            // Create a column vector from eigenvector #i.
            // Note that clone() ensures it will be continuous, so we can treat it like an array, otherwise we can't reshape it to a rectangle.
            // Note that the FaceRecognizer class already gives us L2 normalized eigenvectors, so we don't have to normalize them ourselves.
            Mat eigenvectorColumn = eigenvectors.col(i).clone();
            //printMatInfo(eigenvectorColumn, "eigenvector");

            Mat eigenface = getImageFrom1DFloatMat(eigenvectorColumn, faceHeight);
            //printMatInfo(eigenface, "eigenface");
            imshow(format("Eigenface%d", i), eigenface);
        }

        // Get the eigenvalues
        Mat eigenvalues = model->get<Mat>("eigenvalues");
        printMat(eigenvalues, "eigenvalues");

        //int ncomponents = model->get<int>("ncomponents");
        //cout << "ncomponents = " << ncomponents << endl;

        vector<Mat> projections = model->get<vector<Mat> >("projections");
        cout << "projections: " << projections.size() << endl;
        for (int i = 0; i < (int)projections.size(); i++) {
            printMat(projections[i], "projections");
        }

        //labels = model->get<Mat>("labels");
        //printMat(labels, "labels");
        waitKey(0);

    } catch (cv::Exception e) {
        //cout << "WARNING: Missing FaceRecognizer properties." << endl;
    }

}

int faceTrainer::getBitDepth(const cv::Mat M)
{
    switch (CV_MAT_DEPTH(M.type())) {
        case CV_8U:
        case CV_8S:
            return 8;
        case CV_16U:
        case CV_16S:
            return 16;
        case CV_32S:
        case CV_32F:
            return 32;
        case CV_64F:
            return 64;
    }
    return -1;
}

