// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
// } from "firebase/auth";
// import { collection, addDoc, getDocs, where, query } from "firebase/firestore";
// // import { auth, db } from "../../config/firebase/index.js";
// import { validationResult } from "express-validator";
// import admin from "../../config/accountService.js";

// class AuthController {
//   async signUp(req, res) {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { email, password, name } = req.body;

//     try {
//       const result = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = result.user;
//       await addDoc(collection(db, "users"), {
//         uid: user.uid,
//         email,
//         name,
//         authProvider: "local",
//         role: "user",
//       });
//       res.json({ message: "Sign Up Success" });
//     } catch (err) {
//       if (err.code === "auth/email-already-in-use") {
//         res.status(400).json({ message: "Email already exists" });
//       }
//       if (err.code === "auth/weak-password") {
//         res.status(400).json({ message: "Password length minimum is 6" });
//       } else {
//         res.status(500).json({ message: "Internal Server Error", error: err });
//       }
//     }
//   }
//   async signIn(req, res) {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     try {
//       const { email, password } = req.body;

//       const result = await signInWithEmailAndPassword(auth, email, password);
//       res.json(result);
//     } catch (error) {
//       if (error.code === "auth/invalid-credential") {
//         res.status(401).json({ message: "Wrong email of password" });
//       }
//     }
//   }
//   async signOut(req, res) {
//     try {
//       await signOut(auth);
//       res.json({ message: "Logout success" });
//     } catch (error) {
//       res.json(error);
//     }
//   }
//   async profile(req, res) {
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.split(" ")[0] === "Bearer"
//     ) {
//       try {
//         const authToken = req.headers.authorization.split(" ")[1];
//         admin
//           .auth()
//           .verifyIdToken(authToken)
//           .then(async (decodedToken) => {
//             const uid = decodedToken.uid;

//             const q = query(collection(db, "users"), where("uid", "==", uid));
//             const querySnapshot = await getDocs(q);
//             if (!querySnapshot.empty) {
//               const docData = querySnapshot.docs[0].data();
//               res.json({ decodedToken, docData });
//             } else {
//               res.status(401).send({ message: "No docs found" });
//             }
//           })
//           .catch((error) => {
//             res.status(401).send({ message: "Unauthorized", error });
//           });
//       } catch (error) {
//         res.status(401).send({ message: "Unauthorized" });
//       }
//     } else {
//       res.status(401).send({ message: "Unauthorized" });
//     }
//   }
// }

// export default new AuthController();
