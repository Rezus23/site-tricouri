export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Autentificare</h1>
      <form className="flex flex-col space-y-4 w-64">
        <input className="border p-2 rounded" type="email" placeholder="Email" />
        <input className="border p-2 rounded" type="password" placeholder="Parolă" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Autentifică-te</button>
      </form>
    </div>
  );
}