// GameThumbnail.js

import React from 'react';
import { Link } from 'react-router-dom';

const GameThumbnail = ({ title, src, id}) => {
  return (
    <Link to={`/game/${id}`} className=' rounded-lg'>
        <div className="flex flex-col lg:w-[19rem] lg:h-[12rem] xl:w-auto xl:h-[16.5rem] h-[16.5rem] items-center overflow-hidden mb-4 rounded-3xl">
            <img src={src} alt="thumbnail" width={"400px"} className=' hover:scale-105 duration-200 ease-in' />
        </div>
        <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
    </Link>
  );
};

export default GameThumbnail;
