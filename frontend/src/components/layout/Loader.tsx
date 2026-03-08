import React from "react";
import styled from "styled-components";

const Loader: React.FC = () => {
  return (
    <StyledWrapper>
      <div className="loading-container">
        <div className="loader">
          <div className="cube" />
          <div className="cube" />
          <div className="cube" />
          <div className="cube" />
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .loader {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    width: 80px;
    height: 80px;
    transform: rotate(45deg);
    animation: rotateLoader 2s cubic-bezier(0.6, 0.2, 0.1, 1) infinite;
  }

  .cube {
    width: 35px;
    height: 35px;
    background: linear-gradient(
      145deg,
      oklch(70.7% 0.165 254.624),
      oklch(71.4% 0.203 305.504)
    );
    border-radius: 12px;
    box-shadow:
      0 0 12px oklch(70.7% 0.165 254.624),
      inset 0 0 8px oklch(70.7% 0.165 254.624),
      inset 3px 3px 8px oklch(71.4% 0.203 305.504);
    animation: pulse 1.6s ease-in-out infinite;
    transition: transform 0.4s ease;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow:
        0 0 15px oklch(70.7% 0.165 254.624),
        inset 0 0 8px oklch(70.7% 0.165 254.624);
    }
    50% {
      transform: scale(1.3);
      box-shadow:
        0 0 25px oklch(70.7% 0.165 254.624),
        inset 0 0 12px oklch(71.4% 0.203 305.504);
    }
  }

  @keyframes rotateLoader {
    0% {
      transform: rotate(45deg);
    }
    50% {
      transform: rotate(225deg);
    }
    100% {
      transform: rotate(405deg);
    }
  }

  .cube:nth-child(1) {
    animation-delay: 0s;
  }
  .cube:nth-child(2) {
    animation-delay: 0.2s;
  }
  .cube:nth-child(3) {
    animation-delay: 0.4s;
  }
  .cube:nth-child(4) {
    animation-delay: 0.6s;
  }
`;

export default Loader;

/* 
import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="pyramid-loader">
        <div className="wrapper">
          <span className="side side1" />
          <span className="side side2" />
          <span className="side side3" />
          <span className="side side4" />
          <span className="shadow" />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .pyramid-loader {
    position: relative;
    width: 300px;
    height: 300px;
    display: block;
    transform-style: preserve-3d;
    transform: rotateX(-20deg);
  }

  .wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    animation: spin 4s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotateY(360deg);
    }
  }

  .pyramid-loader .wrapper .side {
    width: 70px;
    height: 70px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    transform-origin: center top;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  }

  .pyramid-loader .wrapper .side1 {
    transform: rotateZ(-30deg) rotateY(90deg);
    background: linear-gradient(to bottom right, #1afbf0, #da00ff);
  }

  .pyramid-loader .wrapper .side2 {
    transform: rotateZ(30deg) rotateY(90deg);
    background: linear-gradient(to bottom right, #1afbf0, #da00ff);
  }

  .pyramid-loader .wrapper .side3 {
    transform: rotateX(30deg);
    background: linear-gradient(to bottom right, #1afbf0, #da00ff);
  }

  .pyramid-loader .wrapper .side4 {
    transform: rotateX(-30deg);
    background: linear-gradient(to bottom right, #1afbf0, #da00ff);
  }

  .pyramid-loader .wrapper .shadow {
    width: 60px;
    height: 60px;
    background: #8b5ad5;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    transform: rotateX(90deg) translateZ(-40px);
    filter: blur(12px);
  }`;

export default Loader;
 */