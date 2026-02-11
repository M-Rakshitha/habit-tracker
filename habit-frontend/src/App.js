import { useState } from "react";
import Auth from "./components/Auth";
import AddHabit from "./components/AddHabit";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <>
      {isLoggedIn ? (
        <AddHabit setIsLoggedIn={setIsLoggedIn} />
      ) : (
        <Auth setIsLoggedIn={setIsLoggedIn} />
      )}
    </>
  );
}

export default App;
