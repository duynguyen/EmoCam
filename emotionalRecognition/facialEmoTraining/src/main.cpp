#include <iostream>
#include <string>
#include <vector>

//OpenCV
#include "opencv2/opencv.hpp"

//Boost
#include "boost/filesystem.hpp"

//Face image pre-processor before training
#include "facepreprocesser.h"
//Training class for facial emotion recognizer
#include "facetrainer.h"


using namespace std;
using namespace cv;
using namespace boost::filesystem;

int main(int argc, char *argv[])
{
    //vector buffer to store preprocessed faces and label
    vector<Mat> preprocessedFace;
    vector<int> label;

    Mat curImg, processedFace;

    int defaultFaceWidth = 120;
    int defaultFaceHeight = 120;

    //path to image database and model
    string path = argv[1];    

    //kinds of emotion to append
    int numEmo = 5;
    string emotion[5] = {"neutral", "happy", "sad", "angry"};

    //path to load the model
    string faceCascadeFilename = path + "model/haarcascade_frontalface_alt.xml";  // Haar face detector.
    string eyeCascadeFilename= path + "model/haarcascade_eye_tree_eyeglasses.xml";   // Best eye detector for open-or-closed eyes.

    //Pre-processer class
    facePreProcessor processor;

    //load the model
    if (!processor.loadModel(faceCascadeFilename, eyeCascadeFilename, cv::Size(defaultFaceWidth, defaultFaceHeight)))
        return 1;
    //loop over each folder of each kind of emotion to collect image
    for(int i=0; i<numEmo; i++){
        string pathToEmo = path + "image/" + emotion[i] + "/";
        cout << "Reading folder " << pathToEmo << endl;

        //now read each image in the folder (use Boost)
        directory_iterator end_itr;

        // cycle through the directory
        for (directory_iterator itr(pathToEmo); itr != end_itr; ++itr)
        {
            // If it's not a directory, list it. If you want to list directories too, just remove this check.
            if (is_regular_file(itr->path())) {
                // assign current file name to current_file and echo it out to the console.
                string current_file = itr->path().string();

                //open image (in grayscale)
                curImg = cv::imread(current_file,0);

                //process the current image
                if (!processor.run(curImg, processedFace))
                    continue;

                //otherwise append the newly processed face and emotion index into the database for training
                preprocessedFace.push_back(processedFace.clone());
                label.push_back(i);

                //add the horizontally flipped image of the processed one two
                Mat flippedImg;
                flip(processedFace, flippedImg, 1);
                preprocessedFace.push_back(flippedImg);
                label.push_back(i);
            }
        }
    }

    cout << "Finished processing all images from database! Training can be started...." << endl;

    /* TRAINING PHASE */
    //    "FaceRecognizer.Eigenfaces":  Eigenfaces, also referred to as PCA (Turk and Pentland, 1991).
    //    "FaceRecognizer.Fisherfaces": Fisherfaces, also referred to as LDA (Belhumeur et al, 1997).
    //    "FaceRecognizer.LBPH":        Local Binary Pattern Histograms (Ahonen et al, 2006).

    const string faceRecAlgo = "FaceRecognizer.Fisherfaces";
    faceTrainer trainer(faceRecAlgo);
    trainer.trainModel(preprocessedFace, label);
    trainer.showTrainingDebugData(defaultFaceWidth,defaultFaceHeight);

    //save the trained model
    trainer.saveModel("../output/trainedModel/model1.xml");
    return 1;
}
