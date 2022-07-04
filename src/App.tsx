import "./App.css";
import React, { useEffect, useState } from "react";
import { getDatabase, onValue, ref, set, remove } from "firebase/database";

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBGC5qZdGVkAdBhbQ9ebBm9j_rwlJZhAAk",
  authDomain: "agenda-5e01f.firebaseapp.com",
  projectId: "agenda-5e01f",
  storageBucket: "agenda-5e01f.appspot.com",
  messagingSenderId: "843322314923",
  appId: "1:843322314923:web:244d3bcf6d7247063e67ee",
};

const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);
interface Topic {
  name: string;
  time: string;
  desc: string;
}

function App() {
  //Boolean values for rendering
  const [isPresenter, setIsPresenter] = useState<boolean>(false);
  const [isNewTopic, setIsNewTopic] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  //New topic inputs
  const [newTopicName, setNewTopicName] = useState<string>("");
  const [newTopicDesc, setNewTopicDesc] = useState<string>("");
  const [newTopicTime, setNewTopicTime] = useState<string>("");
  //Topic description edit
  const [descEdit, setDescEdit] = useState<string>("");
  //Currently displayed topic
  const [currentTopic, setCurrentTopic] = useState({
    name: "",
    desc: "",
    time: "",
  });
  //Topic list for rendering
  const [topicList, setTopicList] = useState<Array<Topic>>([]);

  //Firebase subscription for topic list
  useEffect(() => {
    const topicListRef = ref(db, "topics/");
    let topicListSub = onValue(topicListRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newTopics = Object.values(data) as Array<Topic>;
        setTopicList(newTopics);
      } else {
        setTopicList([]);
      }
    });

    return () => {
      topicListSub();
    };
  }, [currentTopic]);

  useEffect(() => {
    setIsNewTopic(false);
    setNewTopicName("");
    setNewTopicDesc("");
    setNewTopicTime("");
  }, [topicList]);

  //Handlers for conditional rendering
  function togglePresenter() {
    setIsPresenter((isPresenter) => !isPresenter);
  }
  function toggleTopicForm() {
    setIsNewTopic((prevState) => !prevState);
  }
  //Add topic
  function addTopic(e: React.FormEvent) {
    e.preventDefault();
    if (newTopicName.trim() && newTopicDesc.trim() && newTopicTime.trim()) {
      let exists = topicList.filter((t) => t.name === newTopicName);
      if (exists.length === 0) {
        const newTopicRef = ref(db, "topics/" + newTopicName);
        set(newTopicRef, {
          name: newTopicName,
          desc: newTopicDesc,
          time: newTopicTime,
        });
      } else {
        alert("Topic with that name already exists.");
      }
    }
  }
  //Delete topic
  function deleteTopic(e: React.MouseEvent<HTMLButtonElement>) {
    const target = e.target as Element;
    const name = target.getAttribute("value");
    remove(ref(db, "topics/" + name));
    setCurrentTopic({ name: "", desc: "", time: "" });
  }
  //Edit topic description
  function submitDescription() {
    const descriptionRef = ref(db, "topics/" + currentTopic.name);
    set(descriptionRef, {
      name: currentTopic.name,
      desc: descEdit,
      time: currentTopic.time,
    });
    setCurrentTopic({
      name: currentTopic.name,
      desc: descEdit,
      time: currentTopic.time,
    });
    setIsEditing(false);
    setDescEdit("");
  }
  //Change currently displayed topic
  function changeTopic(e: React.MouseEvent<HTMLElement>) {
    const target = e.target as Element;
    const name = target.getAttribute("value");
    let topic = topicList.find((t) => t.name === name);
    if (topic) {
      setCurrentTopic(topic);
    }
  }

  return (
    <div className="App">
      <div className="leftAside">
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <p>Are you the presenter?</p>
          <input
            type="checkbox"
            checked={isPresenter}
            onChange={togglePresenter}
          />
        </div>
        <p className="asideTitle">Meeting Topics</p>
        <ul>
          {topicList.map((t) => {
            return (
              <div className="topicContainer" key={t.name + "div"}>
                <li
                  className="topic"
                  value={t.name}
                  onClick={changeTopic}
                  key={t.name + "li"}
                >
                  {t.name}
                </li>
                {isPresenter ? (
                  <button
                    className="deleteButton"
                    value={t.name}
                    onClick={deleteTopic}
                    key={t.name + "button"}
                  >
                    X
                  </button>
                ) : null}
              </div>
            );
          })}
          {isPresenter ? (
            <li className="topic addTopic" onClick={toggleTopicForm}>
              {isNewTopic ? "Add Topic -" : "Add Topic +"}
            </li>
          ) : null}
        </ul>
        {isNewTopic ? (
          <form autoComplete="off" className="topicForm" onSubmit={addTopic}>
            <label>
              Topic Name:
              <input
                type="text"
                value={newTopicName}
                name="name"
                onChange={(e) => setNewTopicName(e.target.value)}
              />
            </label>
            <label>
              Topic Description:
              <input
                type="text"
                value={newTopicDesc}
                name="desc"
                onChange={(e) => setNewTopicDesc(e.target.value)}
              />
            </label>
            <label>
              Time Estimate (minutes):
              <input
                type="text"
                value={newTopicTime}
                name="time"
                onChange={(e) => setNewTopicTime(e.target.value)}
              />
            </label>
            <input className="topicFormInputButton" type="submit" />
          </form>
        ) : null}
      </div>
      <div className="main">
        {currentTopic.name ? (
          <div className="topicContent">
            <div className="topicHeader">
              <h2 className="topicViewTitle">{currentTopic.name}</h2>
              <h2 className="topicViewTime">~{currentTopic.time} minutes</h2>
            </div>
            <div className="topicBody">
              {!isEditing ? (
                <p className="topicDescription">
                  Description: {currentTopic.desc}
                </p>
              ) : (
                <div className="descriptionEdit">
                  <textarea
                    className="descriptionText"
                    value={descEdit}
                    onChange={(e) => setDescEdit(e.target.value)}
                  />
                  <button
                    className="descriptionSubmit"
                    onClick={submitDescription}
                  >
                    Submit
                  </button>
                </div>
              )}
              {isPresenter ? (
                <button
                  className="editButton"
                  onClick={() => {
                    setIsEditing((prev) => !prev);
                    setDescEdit(currentTopic.desc);
                  }}
                >
                  Edit Description
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <div className="rightAside"></div>
    </div>
  );
}

export default App;
