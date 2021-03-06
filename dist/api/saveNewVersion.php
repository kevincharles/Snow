<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

include "db_connection.php";
$jwtArray = include "jwtArray.php";
$userId = $jwtArray['userId'];

$_POST = json_decode(file_get_contents("php://input"),true);

// $escapedDoenetML = mysqli_real_escape_string($conn,$_POST["doenetML"]);
// $escapedCID = hash('sha256',$escapedDoenetML);
$title =  mysqli_real_escape_string($conn,$_POST["title"]);
$dangerousDoenetML = $_POST["doenetML"];
$branchId = mysqli_real_escape_string($conn,$_POST["branchId"]);
$versionId = mysqli_real_escape_string($conn,$_POST["versionId"]);
$isDraft = mysqli_real_escape_string($conn,$_POST["isDraft"]);
$isNamed = mysqli_real_escape_string($conn,$_POST["isNamed"]);
$isNewTitle = mysqli_real_escape_string($conn,$_POST["isNewTitle"]);


//Add new version to content table
//TODO: Update draft version (Overwrite BranchId named file)

//TODO: Test if we have permission to save to branchId

//save to file as contentid
$contentId = hash('sha256', $dangerousDoenetML);
$response_arr = array(
    "success"=> TRUE,
    "contentId"=> $contentId
);

if ($isDraft){
    $sql = "UPDATE content 
    SET timestamp=NOW()
    WHERE isDraft='1'
    AND branchId='$branchId'
    ";

    $result = $conn->query($sql);
    saveDoenetML($branchId,$dangerousDoenetML);

}elseif($isNewTitle == '1'){
        $sql = "
        UPDATE content
        SET title='$title',isNamed='1'
        WHERE branchId='$branchId'
        AND versionId='$versionId'
        ";
        $result = $conn->query($sql);
    
}else{

    //Protect against duplicate versionId's
    $sql = "
    SELECT versionId
    FROM content
    WHERE versionId='$versionId'
    ";

    $result = $conn->query($sql);
    $row = $result->fetch_assoc();


    if($versionId == $row['versionId']){
        $response_arr = array(
            "success"=> false,
            "versionId"=> $versionId
        );
    }else{

        saveDoenetML($contentId,$dangerousDoenetML);
    
        $sql = "INSERT INTO content 
        SET branchId='$branchId',
        contentId='$contentId', 
        versionId='$versionId', 
        title='$title',
        timestamp=NOW(),
        isDraft='0',
        isNamed='$isNamed'
        ";
    
        $result = $conn->query($sql);
    }
    
}



function saveDoenetML($fileName,$dangerousDoenetML){
    // $fileName = $contentId;
    // if ($isDraft){$fileName = $branchId;}
    //TODO: Config file needed for server
    $newfile = fopen("../media/$fileName.doenet", "w") or die("Unable to open file!");
    fwrite($newfile, $dangerousDoenetML);
    fclose($newfile);
}



// set response code - 200 OK
http_response_code(200);

echo json_encode($response_arr);

$conn->close();

?>

