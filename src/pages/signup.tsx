import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
       console.log("Cont creat:", userCredential.user);

      router.push("/"); // sau către pagina de profil
    } catch (err: unknown) {
      console.error(err);
      setError("Eroare la creare cont. Încearcă alt email.");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">Creează cont</h1>
      <form onSubmit={handleSignUp} className="flex flex-col space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-4 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Parolă (minim 6 caractere)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-4 py-2 rounded"
          required
        />
        <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Creează cont
        </button>
        {error && <p className="text-red-600 text-center">{error}</p>}
      </form>
    </div>
  );
}