// "use client";
// import React, { useState } from "react";

// const Login: React.FC = () => {
//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     try {
//       const response = await fetch("http://127.0.0.1:5001/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert("Login successful!");
        
//         // Save the token in localStorage
//         localStorage.setItem("jwtToken", data.token);

//         // Optional: Redirect or update the UI to indicate the user is logged in
//         console.log("Token:", data.token); // Debugging purpose
//       } else {
//         alert(data.error || "Something went wrong.");
//       }
//     } catch (error) {
//       console.error("Error during login:", error);
//       alert("An error occurred. Please try again.");
//     }
//   };

//   const styles: { [key: string]: React.CSSProperties } = {
//     container: {
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       minHeight: "100vh",
//       backgroundColor: "#0D1117",
//     },
//     loginCard: {
//       padding: "20px",
//       backgroundColor: "#161B22",
//       borderRadius: "8px",
//       boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
//       width: "400px",
//     },
//     header: {
//       textAlign: "center",
//       color: "#C9D1D9",
//     },
//     input: {
//       width: "95%",
//       padding: "12px",
//       margin: "10px 0",
//       backgroundColor: "#24292F",
//       color: "#C9D1D9",
//       border: "1px solid #30363D",
//       borderRadius: "5px",
//     },
//     button: {
//       width: "100%",
//       padding: "12px",
//       backgroundColor: "#58A6FF",
//       color: "#161B22",
//       border: "none",
//       borderRadius: "5px",
//       cursor: "pointer",
//     },
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.loginCard}>
//         <h1 style={styles.header}>Login</h1>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             style={styles.input}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             style={styles.input}
//             required
//           />
//           <button type="submit" style={styles.button}>
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;


"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // For page redirection after login

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter(); // Hook to navigate after successful login

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login successful!");

        // Save the token in localStorage for future requests
        localStorage.setItem("jwtToken", data.token);

        // Redirect to the Text Editor page after successful login
        router.push("/loggedin"); // Change to the correct path where you want to redirect
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#0D1117",
    },
    loginCard: {
      padding: "20px",
      backgroundColor: "#161B22",
      borderRadius: "8px",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
      width: "400px",
    },
    header: {
      textAlign: "center",
      color: "#C9D1D9",
    },
    input: {
      width: "95%",
      padding: "12px",
      margin: "10px 0",
      backgroundColor: "#24292F",
      color: "#C9D1D9",
      border: "1px solid #30363D",
      borderRadius: "5px",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#58A6FF",
      color: "#161B22",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <h1 style={styles.header}>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
