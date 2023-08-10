const imageService = JSON.parse(process.env.NEXT_PUBLIC_IMAGE_SERVICE);

export default function getImageUrl(imageurl) {
  return `${imageService[1]}&file=${
    imageurl && imageurl.replace(imageService[0], "")
  }&ver=${new Date().getTime()}`;
}
