import { useState } from "react";
import Auth from "./components/Auth";
import AddHabit from "./components/AddHabit";
import Journal from "./components/Journal";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <>
      {isLoggedIn ? (
        <>
          <AddHabit setIsLoggedIn={setIsLoggedIn} />
          <Journal />
        </>
      ) : (
        <Auth setIsLoggedIn={setIsLoggedIn} />
      )}
    </>
  );
}

export default App;
