package com.ocdl.client.service.impl;


import com.ocdl.client.service.SegmentService;
import com.ocdl.client.util.CmdHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.nio.file.Paths;

@Service
public class DefaultSegmentService implements SegmentService {

//    private final String MODELBASEPATH = "models/lesion_segmentation";
//    private final String PICBASEPATH = "pictures";
//    private final String SEGPICBASEPATH = "pictures_segmentation";

    @Value("${models.path}")
    private String MODELBASEPATH;

    @Value("${pictures.path}")
    private String PICBASEPATH;

    @Value("${segmentation.path}")
    private String SEGPICBASEPATH;

    @Value("${ground.truth.path}")
    private String GROUNDTRUTHBASEPATH;


    public File run(String pictureName) {

        String currentPath = CmdHelper.runCommand("pwd");
        System.out.println("The currentPath is: ");
        System.out.println(currentPath);


        StringBuilder cmd = new StringBuilder();
        cmd.append("python3 ");
        cmd.append(Paths.get(MODELBASEPATH,"end_tflite.py"));
        cmd.append(" ");
        cmd.append(Paths.get(MODELBASEPATH, "unet_membrane.tflite"));
        cmd.append(" ");
        cmd.append(Paths.get(PICBASEPATH, pictureName));

        System.out.println(pictureName);
        String outputPictureName = pictureName.substring(0, pictureName.lastIndexOf(".")) + "_seg.png";
        System.out.println(outputPictureName);
        cmd.append(" ");
        cmd.append(Paths.get(SEGPICBASEPATH, outputPictureName));

        String groundTruthName = pictureName.substring(0, pictureName.lastIndexOf(".")) + "_segmentation.png";
        System.out.println(groundTruthName);
        cmd.append(" ");
        cmd.append(Paths.get(GROUNDTRUTHBASEPATH, groundTruthName));


        String result = CmdHelper.runCommand(cmd.toString());
        System.out.println("If has result:" + !result.isEmpty());
        System.out.println("The result is: ");
        System.out.println(result);

        return new File(Paths.get(SEGPICBASEPATH, outputPictureName).toString());
    }





}
