import React, { useState, useEffect } from 'react';
import {
  randomSquare,
  randomSquareSettings,
  defaultFromDataSettings,
} from './randomSquare';
import { convertToAlgebra } from '../../../Chess';
import type { Square } from '../../../Chess';
import { Header } from './Header';
import { FinishScreen } from './FinishScreen';
import { AnswerScreen } from './AnswerScreen';
import { SquareColorDialog } from './SquareColorDialog';

import type { AddInfo } from './randomSquare';

interface SquareProps {
  amount: number;
  settings?: randomSquareSettings;
}

export interface answerData {
  square: Square;
  answer: boolean;
  time: number;
}

export const SquareColors: React.FC<SquareProps> = (props: SquareProps) => {
  const { amount, settings } = props;
  const [count, setCount] = useState(1);
  const [show, setShow] = useState(false);
  const [finish, setFinish] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState<answerData[]>([]);

  const [squares, setSquares] = useState<Square[]>([]);
  const [addInfo, setAddInfo] = useState<AddInfo>({});

  useEffect(() => {
    randomSquare(amount, callbackSquareData, settings);
  }, [amount, settings]);

  const restart = () => {
    setLoading(true);
    randomSquare(amount, callbackSquareData, settings);
    setAnswers([]);
    setCount(1);
    setCorrect(0);
    setShow(false);
    setFinish(false);
  };

  function callbackSquareData(square: Square[], addData: AddInfo) {
    setSquares(square);
    setAddInfo(addData);
    setLoading(false);
  }

  const increase = () => {
    setShow(false);
    if (count < amount) {
      setCount(count + 1);
    } else {
      setFinish(true);
    }
  };

  if (loading) {
    return <div>LOADING</div>;
  }

  if (!finish) {
    const weights = settings
      ? {
          time: settings.settings.timeWeight
            ? settings.settings.timeWeight
            : defaultFromDataSettings.timeWeight,
          mistake: settings.settings.mistakesWeight
            ? settings.settings.mistakesWeight
            : defaultFromDataSettings.mistakesWeight,
        }
      : undefined;
    return (
      <div>
        <Header amount={amount} count={count} show={show} correct={correct} />
        {!show ? (
          <SquareColorDialog
            amount={amount}
            square={squares[count - 1]}
            answerCallback={(answer, time) => {
              setAnswers([
                ...answers,
                { square: squares[count - 1], answer, time },
              ]);
              if (answer) {
                setCorrect(correct + 1);
              }
              setShow(true);
            }}
          />
        ) : (
          <AnswerScreen
            square={squares[count - 1]}
            answer={answers[count - 1].answer}
            addInfo={{
              info: addInfo[convertToAlgebra(squares[count - 1])],
              general: addInfo.general,
              weights,
            }}
            nextCallback={() => {
              increase();
              setShow(false);
            }}
          />
        )}
      </div>
    );
  }
  return (
    <FinishScreen amount={amount} answers={answers} restartCallback={restart} />
  );
};

SquareColors.defaultProps = {
  settings: undefined,
};
