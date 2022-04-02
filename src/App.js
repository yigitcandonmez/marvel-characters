/* eslint-disable no-unused-vars */ /* --> for features */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Logo from "./assets/images/logo.webp";

const App = () => {
  const [data, setData] = useState({
    results: [],
    total: 0,
  });
  const [error, setError] = useState({
    code: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const cardTop = useRef(null);
  const charactersPerPage = 12;

  useEffect(() => {
    const sessionCharacterStorage =
      JSON.parse(sessionStorage.getItem("characterData")) || [];
    const totalData = JSON.parse(sessionStorage.getItem("totalData")) || 0;

    const fetchData = async () => {
      const response = await axios
        .get(
          `https://gateway.marvel.com:443/v1/public/characters?offset=${(currentPage - 1) * charactersPerPage
          }&limit=${charactersPerPage}&apikey=235b1060098a246f097e986cc1e44ce6`
        )
        .then((res) => {
          sessionStorage.setItem(
            "characterData",
            JSON.stringify({
              ...sessionCharacterStorage,
              [currentPage]: [...res.data.data.results],
            })
          );
          sessionStorage.setItem(
            "totalData",
            JSON.stringify({
              total: res.data.data.total,
            })
          );
          setData({
            results: [...res.data.data.results],
            total: res.data.data.total,
          });
          setLoading(false);
          cardTop.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        })
        .catch((err) => {
          setError({
            ...error,
            code: err.response.data.code,
            message: err.response.data.message,
          });
        });
    };

    if (sessionCharacterStorage[currentPage]) {
      setData({
        results: [...sessionCharacterStorage[currentPage]],
        total: totalData.total,
      });
      setLoading(false);
      cardTop.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      setLoading(true);
      fetchData();
    }
  }, [currentPage]);

  const handlePageNumber = (e) => {
    setCurrentPage(Number(e.target.innerText));
  };

  const paginationGenerator = () => {
    const paginationArray = [];
    const maxPageNumberLimit = 4;
    let startLimit = null;
    let endLimit = null;
    let sliceStart = null;
    let sliceEnd = null;

    const pushPageNumbers = () => {
      for (let i = 1; i <= Math.ceil(data.total / charactersPerPage); i++) {
        paginationArray.push(i);
      }
    };

    const limitCheck = () => {
      if (currentPage >= paginationArray[0] + maxPageNumberLimit) {
        startLimit = (
          <li
            onClick={(e) => {
              handlePageNumber(e);
            }}
          >
            {paginationArray[0]}
          </li>
        );
      }

      if (
        currentPage <=
        paginationArray[paginationArray.length - 1] - maxPageNumberLimit
      ) {
        endLimit = (
          <li
            onClick={(e) => {
              handlePageNumber(e);
            }}
          >
            {paginationArray[paginationArray.length - 1]}
          </li>
        );
      }
    };

    const sliceCheck = () => {
      if (currentPage < paginationArray[0] + maxPageNumberLimit) {
        sliceStart = paginationArray[0] - 1;
        sliceEnd =
          currentPage === 4 ? maxPageNumberLimit + 1 : maxPageNumberLimit;
      } else if (
        currentPage >= paginationArray[0] + maxPageNumberLimit &&
        currentPage <=
        paginationArray[paginationArray.length - 1] - maxPageNumberLimit
      ) {
        sliceStart = currentPage - 2;
        sliceEnd = currentPage + 1;
      } else {
        sliceStart =
          paginationArray[paginationArray.length - 1] - currentPage === 3
            ? paginationArray[paginationArray.length - 1] -
            maxPageNumberLimit - 1
            : paginationArray[paginationArray.length - 1] - maxPageNumberLimit;
        sliceEnd = paginationArray[paginationArray.length - 1];
      }
    };

    pushPageNumbers();
    limitCheck();
    sliceCheck();

    return (
      <div>
        {currentPage >= 5 && (
          <li
            onClick={() => {
              setCurrentPage((prev) => prev - 1);
            }}
          >
            <svg width="12px" height="12px" viewBox="0 0 24 24" fill="#7E7E7E">
              <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
            </svg>
          </li>
        )}
        {startLimit}
        {startLimit && <li>...</li>}
        {paginationArray.slice(sliceStart, sliceEnd).map((e) => {
          return (
            <li
              className={e === currentPage ? "active" : ""}
              onClick={handlePageNumber}
              key={e}
            >
              {e}
            </li>
          );
        })}
        {endLimit && <li>...</li>}
        {endLimit}
        {currentPage <=
          paginationArray[paginationArray.length - 1] - maxPageNumberLimit && (
            <li
              onClick={() => {
                setCurrentPage((prev) => prev + 1);
              }}
            >
              <svg width="12px" height="12px" viewBox="0 0 24 24" fill="#7E7E7E">
                <path d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z" />
              </svg>
            </li>
          )}
      </div>
    );
  };

  const pagination = paginationGenerator();

  return (
    <div className="App">
      <header className="display--flex">
        <div className="header__background">
          <div className="header__fade__gradient"></div>
        </div>
        <div className="header__logo">
          <img src={Logo} alt="marvel-logo" ref={cardTop} />
        </div>
      </header>
      <div className="card__wrapper">
        <div className="card display--flex">
          {error.code !== "" ? (
            <div className="error">
              <p>{error.code}</p>
              <p>{error.message}</p>
            </div>
          ) : loading ? (
            <div className="loading__screen">
              <div className="sk-folding-cube">
                <div className="sk-cube1 sk-cube"></div>
                <div className="sk-cube2 sk-cube"></div>
                <div className="sk-cube4 sk-cube"></div>
                <div className="sk-cube3 sk-cube"></div>
              </div>
            </div>
          ) : (
            data.results?.map((e) => {
              return (
                <div className="card__item" key={e.id}>
                  <div className="card__item__image">
                    <img
                      src={`${e.thumbnail.path}.${e.thumbnail.extension}`}
                      alt={`${e.name}`}
                    />
                  </div>
                  <div className="card__item__title display--flex">
                    {e.name}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="pagination display--flex">{pagination}</div>
      </div>
    </div>
  );
};

export default App;
