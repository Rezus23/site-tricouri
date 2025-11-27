export default function BlurredBackground() {
  return (
    <div 
      className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: "url('/images/wc-bg.png')",
        // Aici controlăm cât de tare este blurată imaginea (blur-md, blur-lg, blur-xl)
        filter: "blur(8px) brightness(0.7)" 
      }}
    ></div>
  );
}