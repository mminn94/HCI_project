import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function QuizPage() {
  const navigate = useNavigate();

  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem("topics");
    return saved ? JSON.parse(saved) : ["알고리즘", "HCI", "컴퓨터구조", "프로그래밍언어론"];
  });
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [newTopic, setNewTopic] = useState("");
  const [userInput, setUserInput] = useState("");
  const [chatHistories, setChatHistories] = useState(() => {
    const saved = localStorage.getItem("chatHistories");
    return saved ? JSON.parse(saved) : {
      알고리즘: [],
      HCI: [],
      컴퓨터구조: [],
      프로그래밍언어론: []
    };
  });

  const [quizResults, setQuizResults] = useState(() => {
    const saved = localStorage.getItem("quizResults");
    return saved ? JSON.parse(saved) : [];
  });

  const [showQuizHistory, setShowQuizHistory] = useState(false);

  useEffect(() => {
    const savedTopics = localStorage.getItem("topics");
    const savedHistories = localStorage.getItem("chatHistories");
    if (savedTopics) setTopics(JSON.parse(savedTopics));
    if (savedHistories) setChatHistories(JSON.parse(savedHistories));
  }, []);

  useEffect(() => {
    localStorage.setItem("topics", JSON.stringify(topics));
    localStorage.setItem("chatHistories", JSON.stringify(chatHistories));
  }, [topics, chatHistories]);

  useEffect(() => {
    localStorage.setItem("quizResults", JSON.stringify(quizResults));
  }, [quizResults]);

  const handleAddTopic = () => {
    const trimmed = newTopic.trim();
    if (!trimmed) return;
    if (!topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
      setChatHistories({
        ...chatHistories,
        [trimmed]: []
      });
      setSelectedTopic(trimmed); // 새로 추가하면 자동으로 선택되게
    }
    setNewTopic("");
  };

  const handleSend = async () => {
    if (!userInput) return;

    const currentHistory = chatHistories[selectedTopic];

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        topic: selectedTopic,
        message: userInput,
        history: currentHistory.map((h) => h.message)
      });

      const aiResponse = res.data.response;

      const updatedHistory = [
        ...currentHistory,
        { sender: "user", message: userInput },
        { sender: "ai", message: aiResponse }
      ];

      setChatHistories({
        ...chatHistories,
        [selectedTopic]: updatedHistory
      });

      if (userInput.toLowerCase().includes("퀴즈")) {
        setQuizResults((prevResults) => {
          const updatedResults = [...prevResults, { topic: selectedTopic, quiz: aiResponse }];
          localStorage.setItem("quizResults", JSON.stringify(updatedResults));
          return updatedResults;
        });
      }


      setUserInput("");
    } catch (err) {
      console.error(err);
      alert("AI 응답 실패!");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-[30px] font-bold mb-4">🧠 Gemma3와 대화하기 | Chat with AI</h2>
      <p className="text-sm text-gray-400 mb-6 ml-3">
        퀴즈를 진행하려면 "퀴즈 내줘"라고 입력하세요 !
      </p>

      <div className="flex gap-2 mb-2 flex-wrap">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className="px-3 py-1 h-15 w-35 rounded"
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="새로운 주제 입력"
          className="flex-1 border px-2 py-1 rounded"
        />
        <button
          onClick={handleAddTopic}
          className="px-3 py-1 rounded"
        >
          추가 | add
        </button>
      </div>

      {/* 대화창 */}
      <div className="h-70 w-140 overflow-y-auto border p-2 mb-4 rounded">
        {chatHistories[selectedTopic].map((entry, idx) => (
          <div
            key={idx}
            className={`mb-1 ${entry.sender === "user" ? "text-right" : "text-left"}`}
          >
            <span
              className={`block whitespace-pre-line ${entry.sender === "user" ? "text-blue-500" : "text-green-500"} text-base`}
            >
              {entry.sender === "user" ? "👤" : "🤖"} {entry.message}
            </span>
          </div>
        ))}
      </div>

      {/* 사용자 입력창 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
          placeholder="질문을 입력하세요"
        />
        <button
          onClick={handleSend}
          className="px-4 py-1 rounded"
        >
          보내기 | Send
        </button>
      </div>

      {/* 🟡 퀴즈 내역 토글 버튼 */}
      {quizResults.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowQuizHistory(!showQuizHistory)}
            className="px-4 py-1 rounded bg-purple-300 hover:bg-purple-400 mt-4 mb-2"
          >
            {showQuizHistory ? "📝 퀴즈 내역 닫기" : "📝 퀴즈 내역 보기"}
          </button>

          {/* 토글로 열고 닫는 퀴즈 내역 */}
          {showQuizHistory && (
            <div className="mt-2">
              <h3 className="text-lg font-semibold">📝 퀴즈 내역 | Quiz</h3>
              <ul className="list-disc pl-4">
                {quizResults.map((q, idx) => (
                  <li key={idx} className="whitespace-pre-line">
                    <strong>{q.topic}:</strong> {q.quiz}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300 mt-4 mb-4">
        🏠 홈으로 돌아가기 | Home
      </button>
    </div>
  );
}

export default QuizPage;
