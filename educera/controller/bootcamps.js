const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const geocoder = require("../utils/geocoder");

//@desc get all bootcamps
//@route GET /api/v1/bootcamps
//@acess Public
exports.getbootCamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
//@desc get sinlge bootcamps
//@route GET /api/v1/bootcamps/:id
//@acess Public
exports.getbootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  res.status(200).json({ success: true, data: bootcamp });
});
//@desc create a bootcamp
//@route POST /api/v1/bootcamps
//@acess Public
exports.createbootCamp = asyncHandler(async (req, res, next) => {
  //adding user to bootcamp
  req.body.user = req.user.id;
  //finding if user have already publishesd a bootcamp
  const publishBootcamp = await Bootcamp.find({ user: req.user.id });
  if (publishBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `sorry this user ${req.params.id} already creat a boocamp `,
        404
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({ success: true, data: bootcamp });
});
//@desc update a bootcamps
//@route PUT/api/v1/bootcamps/:id
//@acess Public
exports.editbootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with the id of ${req.params.id}`,
        404
      )
    );
  }
  //check bootcamp ownership and admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`soory this user can't update this bootcamp`, 401)
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: bootcamp });
});
//@desc delete a bootcamp
//@route DELETE /api/v1/bootcamps
//@acess Public
exports.deletebootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with the id of ${req.params.id}`,
        404
      )
    );
  }
  //check bootcamp ownership and admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`soory this user can't delete this bootcamp`, 401)
    );
  }

  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});

//@desc  Get bootcamp within a radius
//@route GET /api/v1/bootcamps/radius/:zipcode/:distance
//@acess Private
exports.getbootCampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //calc radius using radian
  //Divide dist by radius of earth
  //Earth radius =3693 mi/ 6378 km
  const radius = distance / 3693;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

//@desc upload a photo
//@route PUT /api/v1/bootcamps/:id/photo
//@acess Public
exports.uploadPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with the id of ${req.params.id}`,
        404
      )
    );
  }
  //check bootcamp ownership and admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`sorry this user can't update this bootcamp`, 401)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file `, 400));
  }
  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file `, 400));
  }
  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(
      new ErrorResponse(
        `Please you can only upload file size max ${process.env.MAX_FILE_SIZE}`,
        400
      )
    );
  }
  //custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  //move file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      return next(new ErrorResponse(`problem with file uploading`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file });
  });
  res.status(200).json({ success: true, data: file.name });
});
