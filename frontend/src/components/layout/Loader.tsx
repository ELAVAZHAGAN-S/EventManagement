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
      oklch(100% 0.00011 271.152),
      oklch(92.4% 0.12 95.746)
    );
    border-radius: 12px;
    box-shadow:
      0 0 12px oklch(92.4% 0.12 95.746),
      inset 0 0 8px oklch(92.4% 0.12 95.746),
      inset 3px 3px 8px oklch(100% 0.00011 271.152);
    animation: pulse 1.6s ease-in-out infinite;
    transition: transform 0.4s ease;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow:
        0 0 15px oklch(92.4% 0.12 95.746),
        inset 0 0 8px oklch(92.4% 0.12 95.746);
    }
    50% {
      transform: scale(1.3);
      box-shadow:
        0 0 25px oklch(92.4% 0.12 95.746),
        inset 0 0 12px oklch(100% 0.00011 271.152);
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