import "./TaskPage.css";
import { useState, useEffect, Fragment } from "react";

function TaskPage() {
  //タスクの配列
  const [tasks, setTasks] = useState(() => {
    {/*savedTasksに保存済みのタスクを読み込む*/ }
    const savedTasks = localStorage.getItem("stellaTasks");
    {/*savedTasksの中身があったら、それを配列にもどして渡す、なかったら空の配列を渡す*/ }
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  //追加中か
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  //タスク名の入力
  const [taskName, setTaskName] = useState("");
  //タスクの難易度
  const [difficulty, setDifficulty] = useState(1);
  //編集中か
  const [editingId, setEditingId] = useState(null);
  //編集専用のタスク名
  const [editName, setEditName] = useState("");
  //編集専用の難易度
  const [editDifficulty, setEditDifficulty] = useState(1);
  //ドラッグしているタスクのID
  const [draggingId, setDraggingId] = useState(null);
  //挿入位置
  const [dropIndex, setDropIndex] = useState(null);

  //タスクの配列を保存
  useEffect(() => {
    localStorage.setItem("stellaTasks", JSON.stringify(tasks));
  }, [tasks]);

  //６０秒ごとに日付の更新がないかチェック
  useEffect(() => {
    //次の日にタスクの完了状況をリセットする
    function checkDate() {
      const today = getToday();
      const lastDate = localStorage.getItem("stellaLastDate");
      //今日と最後の日付が違ったら
      if (lastDate !== today) {
        //すべてのタスクを未完了にする
        setTasks(prevTasks => prevTasks.map(
          task => ({
            ...task,
            completed: false
          }))
        );
        //今日の日付を保存する
        localStorage.setItem("stellaLastDate", getToday());
      }
    }

    checkDate();
    const timerId = setInterval(() => {
      checkDate();
    }, 60000);
    //ページが再表示されたら日付を更新
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        checkDate();
      }
    }
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    //useEffectのreturnは、コンポーネントが画面から消えるときなどに実行されるクリーンアップ処理
    // タイマーを停止する
    return () => {
      clearInterval(timerId);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  //クリックしたら完了になる
  function toggleTask(id) {
    setTasks(prevTasks => prevTasks.map(
      (task) => {
        if (task.id === id) {
          return {
            ...task,
            completed: !task.completed
          };
        }
        return task;
      }
    ));
  }

  //タスクを削除する
  function deleteTask(id) {
    setTasks(prevTasks => prevTasks.filter((task) => task.id !== id));
  }
  //編集を保存
  function saveEdit() {
    if (editName.trim() === "") {
      return;
    }
    setTasks(prevTasks => prevTasks.map(
      (task) => {
        if (task.id === editingId) {
          return {
            ...task,
            title: editName,
            difficulty: editDifficulty
          }
        }
        return task;
      }
    ))
    setEditingId(null);
  }
  //日付を取得
  function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${year}-${month}-${day}`;

  }
  //ドラッグしたら配列の順番を変える
  function moveTask(targetIndex) {
    if (draggingId === null) return;
    setTasks(prevTasks => {
      //一致するタスクの要素番号を返す
      const fromIndex = prevTasks.findIndex(
        task => task.id === draggingId
      );
      //見つからなかった場合の対策
      if (fromIndex === -1) return prevTasks;
      //配列をコピー
      const newTasks = [...prevTasks];
      //コピーした配列から削除した要素を返す
      const [movedTask] = newTasks.splice(fromIndex, 1);
      //入れる場所
      const insertIndex = targetIndex > fromIndex ?
        targetIndex - 1 : targetIndex;
      //insertIndexの場所に挿入して、何も削除せず、さっき削除した配列を挿入する
      newTasks.splice(insertIndex, 0, movedTask);
      return newTasks;
    });
    //ドラッグ中のIDと挿入位置をリセット
    setDraggingId(null);
    setDropIndex(null);
  }




  return (
    <div className="task-page">
      <div className="task-header">
        <h1>今日のタスク</h1>
        <button onClick={() => setIsAddModalOpen(true)}>＋追加</button>
      </div>
      {/*入力欄(追加ボタン押したときだけ表示)*/}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="task-form add-modal">
            <h2>新しいタスクを追加</h2>
            <input type="text"
              placeholder="タスク名を入力..."
              onChange={(e) => setTaskName(e.target.value)}
              value={taskName}
              autoFocus />

            <div className="task-form-bottom">

              {/* 難易度選択 */}
              <select value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}>
                <option value="1">Lv.1 EASY</option>
                <option value="2">Lv.2 NORMAL</option>
                <option value="3">Lv.3 HARD</option>
                <option value="4">Lv.4 EXPERT</option>
                <option value="5">Lv.5 EXTREME</option>
              </select>

              {/*追加ボタン*/}
              <button onClick={() => {
                {/*空欄だったら追加しない*/ }
                if (taskName.trim() === "") {
                  return;
                }

                {/*newTaskの定義*/ }
                const newTask = {
                  id: crypto.randomUUID(),
                  title: taskName,
                  completed: false,
                  difficulty: difficulty
                };

                {/*配列の最後に追加*/ }
                setTasks([...tasks, newTask]);
                setTaskName("");
                setIsAddModalOpen(false);
              }}>追加</button>

            </div>
            <button
              className="cancel"
              onClick={() => { setIsAddModalOpen(false); }}>キャンセル</button>

          </div>

        </div>
      )}

      <div
        className="task-list"
        onDragOver={(e) => {
          e.preventDefault();
        }}>
        {/*一番上のドラッグエリア*/}
        <div
          className="top-drop-zone"
          onDragOver={(e) => {
            e.preventDefault();
            setDropIndex(0);
          }}
          onDrop={(e) => {
            e.preventDefault();
            moveTask(0);
          }}></div>
        {/*一覧*/}
        {tasks.map((task, index) => (
          <Fragment key={task.id}>

            {/*タスクのまとまり*/}
            <div
              className={`task-row ${
                //ドラッグ中かつドラッグしているタスク以外を暗くする
                draggingId !== null && draggingId !== task.id
                  ? "drag-dimmed" : ""
                }
                ${dropIndex === index ? "drop-before" : ""}
                ${dropIndex === tasks.length && index === tasks.length - 1 ? "drop-after" : ""}`}
              onDragOver={(e) => {
                //ドロップ可能にする
                e.preventDefault();
                //タスクの位置と高さを取得する
                const rect = e.currentTarget.getBoundingClientRect();
                //タスク中央のY座標
                const middleY = rect.top + rect.height / 2;
                //上にあるか
                const isUpper = e.clientY < middleY;
                //挿入位置を更新
                setDropIndex(isUpper ? index : index + 1);
              }}
              onDrop={(e) => {
                //ドロップ可能にする
                e.preventDefault();
                //タスクの位置と高さを取得する
                const rect = e.currentTarget.getBoundingClientRect();
                //タスク中央のY座標
                const middleY = rect.top + rect.height / 2;
                //上にあるか
                const isUpper = e.clientY < middleY;
                //挿入位置を更新
                moveTask(isUpper ? index : index + 1);
              }}
            >
              {/*タスクボタン*/}
              <button
                onClick={() => { toggleTask(task.id) }}
                className={`difficulty-${task.difficulty} ${task.completed ? "completed" : "incomplete"}`}>
                {task.completed && <span className="task-check">✔</span>}
                {task.title}</button>
              {/*ドラッグボタン*/}
              <span
                className="drag-handle"
                draggable={true}
                onDragStart={() => {
                  setDraggingId(task.id);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDropIndex(null);
                }}
              >⠿</span>
              {/*編集ボタン*/}
              <button
                className="task-action-button edit-button"
                onClick={() => {
                  setEditingId(task.id);
                  setEditName(task.title);
                  setEditDifficulty(task.difficulty);
                }}>編集</button>
              {/*削除ボタン*/}
              <button
                className="task-action-button delete-button"
                onClick={() => deleteTask(task.id)}>×</button>
            </div>
          </Fragment>
        ))}
        {/*一番下のドラッグエリア*/}
        <div
          className="bottom-drop-zone"
          onDragOver={(e) => {
            e.preventDefault();
            setDropIndex(tasks.length);
          }}
          onDrop={(e) => {
            e.preventDefault();
            moveTask(tasks.length);
          }}
        />
      </div>

      {/*編集画面：editingIdがあるときだけ表示*/}
      {editingId !== null && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h2>タスクを編集</h2>
            {/*入力欄*/}
            <input type="text" placeholder="タスク名を入力..."
              onChange={(e) => setEditName(e.target.value)}
              value={editName} autoFocus />
            <div className="edit-bottom">
              {/* 難易度選択 */}
              <select value={editDifficulty}
                onChange={(e) => setEditDifficulty(Number(e.target.value))}>
                <option value="1">Lv.1 EASY</option>
                <option value="2">Lv.2 NORMAL</option>
                <option value="3">Lv.3 HARD</option>
                <option value="4">Lv.4 EXPERT</option>
                <option value="5">Lv.5 EXTREME</option>
              </select>
              <button onClick={saveEdit}>保存</button>
            </div>
            <button
              className="cancel"
              onClick={() => setEditingId(null)}>キャンセル</button>
          </div>
        </div>
      )}
    </div>

  );
}



export default TaskPage;