export function getS3ImageUrl(s3Path: string | null | undefined) {
  if (!s3Path) return null;
  if (s3Path.startsWith("http://") || s3Path.startsWith("https://")) {
    return s3Path;
  }
  const region = process.env.NEXT_PUBLIC_S3_REGION || "us-east-1";
  const bucket = process.env.NEXT_PUBLIC_S3_PUBLIC_BUCKET || "lifoo-dev-public";
  const cleanPath = s3Path.replace(/^\/+/, "");
  return `https://${bucket}.s3.${region}.amazonaws.com/${cleanPath}`;
}
