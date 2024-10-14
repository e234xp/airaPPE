const dataParser = require('../../utility/dataParser');

function requireDataOk(data) {
  if (data == null
    || data.start_time == null
    || data.end_time == null
    || data.slice_shift == null
    || data.slice_length == null
    || data.with_image == null) {
    return false;
  }
  return true;
}

exports.call = async function (req, res) {
  const reqData = dataParser.circularJsonParser(req.body);
  if (!requireDataOk(reqData)) {
    res.status(400).json({ message: 'Invalid parameter.' });
  } else {
    try {
      const shift = (reqData.slice_shift != null ? reqData.slice_shift : 0);
      const sliceLength = (reqData.slice_length != null ? reqData.slice_length : 100);
      const withImage = (reqData.with_image != null ? reqData.with_image : true);
      let resultList = [];
      if (withImage === true) {
        resultList = await global.airaTabletLiteNonVerifyResultReader.readDb(reqData.start_time, reqData.end_time, null);
      } else {
        resultList = await global.airaTabletLiteNonVerifyResultReader.readDbNoImage(reqData.start_time, reqData.end_time, null);
      }
      res.status(200).json({
        message: 'ok',
        result: {
          total_length: resultList ? resultList.length : 0,
          slice_shift: shift,
          slice_length: sliceLength,
          data: resultList ? resultList.slice(shift, shift + sliceLength) : [],
        },
      });

      // global.airaTabletLiteNonVerifyResultReader.readDb( reqData.start_time, reqData.end_time, null, function( resultList ) {
      //     res.status( 200 ).json({ message : "ok", result : {
      //         total_length : resultList ? resultList.length : 0,
      //         slice_shift : shift,
      //         slice_length : sliceLength,
      //         data : resultList ? resultList.slice( shift, shift + sliceLength ).filter( item => {
      //             if( withImage != true && item["face_image"] ) delete item["face_image"];
      //             return true;
      //         }) : []
      //     }});
      // });
    } catch (e) {
      res.status(500).json({ message: `${e}` });
    }
  }
};
//
//
