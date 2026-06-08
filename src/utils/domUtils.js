export async function browserHasImmersiveARCompatibility() {
  const immersiveOK = await navigator.xr.isSessionSupported('immersive-ar');
  return immersiveOK;  
}