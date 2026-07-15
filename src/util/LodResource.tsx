import React from 'react';
import { useAppDispatch } from '../redux/hook';
import { useEffect } from 'react';
import {
  loadAnalysisData,
  loadDeviceSongs,
  loadFavouriteSOng,
  loadPLayList,
  loadRecommendedSongs,
} from '../redux/actions/actions';
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

  useEffect(() => {
    dispatch(loadRecommendedSongs());
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadAnalysisData());
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadDeviceSongs());
  }, [dispatch]);

  return <Navigation />;
};

export default LodResource;
