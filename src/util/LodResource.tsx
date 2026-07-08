import React from 'react';
import { useAppDispatch } from '../redux/hook';
import { useEffect } from 'react';
import { loadFavouriteSOng, loadPLayList } from '../redux/actions/actions';
import Navigation from '../navigation/StackNavigation/Navigation';
import { initPlayer } from './initPlayer';

const LodResource = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    initPlayer();
  }, []);

  useEffect(() => {
    dispatch(loadFavouriteSOng());
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadPLayList());
  }, [dispatch]);

  return (
      <Navigation /> 
  )
};

export default LodResource;