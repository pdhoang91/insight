// //context/UserContext.js
import { createContext, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);


export default UserContext;



// context/UserContext.js
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import useAuth from '../hooks/useAuth'; // Đảm bảo rằng bạn có hook useAuth

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const { user: authUser, setUser: setAuthUser, loading } = useAuth(); // Sử dụng hook useAuth
//   const [modalOpen, setModalOpen] = useState(false);

//   return (
//     <UserContext.Provider value={{ user: authUser, setUser: setAuthUser, modalOpen, setModalOpen, loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);

// export default UserContext;




