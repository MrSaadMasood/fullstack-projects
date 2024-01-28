// GameSelectionPage.js

import React from 'react';
import GameThumbnail from './GameThumbail';

const games = [
  { id: "65b0d965a74ce3084a3f100b", title: 'Chaos Party', src : "/thumbnail/game1-thumbnail.jpg" },
  { id: "65b4cdd494429f9a59e82c6a", title: 'Multiversal Disruption', src : "/thumbnail/game2-thumbnail.jpg" },
  { id: "65b4ce156d7680a1130cba7a", title: 'Parley', src : "/thumbnail/game3-thumbnail.png" },
];

const GameSelectionPage = () => {

  return (
    <div className=' bg-black h-screen text-white flex flex-col justify-center items-center'>
        <div className=' text-4xl mb-6 md:mb-6'>
            Select A Game
        </div>
        <div className=' flex flex-col items-center overflow-y-scroll noScroll lg:flex lg:flex-row lg:justify-between
        xl:justify-around lg:items-center 
         w-[90%] h-[60%] md:h-[70%] lg:h-[50%] xl:h-[50%] xl:w-[95%] '>
        {games.map((game)=>{
            return (
                <div key={game.id} className=' rounded-xl'>
                    <GameThumbnail id={game.id} src={game.src} title={game.title} />
                </div>
            )
        })}
        </div>
    </div>
  );
};

export default GameSelectionPage;
