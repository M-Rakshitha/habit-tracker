import { useState } from "react";
import Auth from "./components/Auth";
import AddHabit from "./components/AddHabit";
import Journal from "./components/Journal";
import ChatAgent from "./components/ChatComponent";

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
          <ChatAgent />
        </>
      ) : (
        <Auth setIsLoggedIn={setIsLoggedIn} />
      )}
    </>
  );
}

export default App;
