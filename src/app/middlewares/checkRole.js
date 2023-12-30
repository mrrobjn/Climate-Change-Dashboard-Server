import admin from "../../config/accountService.js";
import { db } from "../../config/firebase/index.js";
import { collection, getDocs, query, where } from "firebase/firestore";

const checkRole = async (req, res, next) => {
  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.split(" ")[0] === "Bearer"
  // ) {
  //   const authToken = req.headers.authorization.split(" ")[1];
  //   try {
  //     const decodedToken = await admin.auth().verifyIdToken(authToken);
  //     const uid = decodedToken.uid;
  //     const q = query(collection(db, "users"), where("uid", "==", uid));
  //     const querySnapshot = await getDocs(q);

  //     if (!querySnapshot.empty) {
  //       const docData = querySnapshot.docs[0].data();
  //       if (docData.role === "admin") {
  //         next();
  //       } else {
  //         res.status(401).send({ message: "Unauthorized" });
  //       }
  //     } else {
  //       res.status(401).send({ message: "No docs found" });
  //     }
  //   } catch (error) {
  //     res.status(401).send({ message: "Unauthorized" });
  //   }
  // } else {
  //   res.status(401).send({ message: "Unauthorized" });
  // }
  next();
};

export default checkRole;
