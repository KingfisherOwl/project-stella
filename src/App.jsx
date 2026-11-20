import "./App.css";
//タスク画面を表示する
import TaskPage from "./pages/TaskPage";
import { useState } from "react";


function App() {
  const [currentPage, setCurrentPage] = useState("tasks");
  return (
    <div className="layout">
      {/*//SidebarではchangePageという名前で関数を使う*/}
      <Sidebar changePage={setCurrentPage}/>
      {/*メイン画面*/}
      <main className="content">
        {/*currentPageがtasksだったらタスク画面を表示する*/}
        {currentPage === "tasks" && <TaskPage />}
        {currentPage === "map" && <h1>マップ画面</h1>}
      </main>
    </div>
    
  );
}

function Sidebar({changePage}){
  return(
    <aside className="sidebar">{/*サイドバーなどのためのタグ*/}
      <h2>STELLA</h2>
      <button onClick={() => changePage("tasks")} className="sidebarButton">タスク</button>
      <button onClick={() => changePage("map")} className="sidebarButton">マップ</button>
    </aside>
  );
}

export default App