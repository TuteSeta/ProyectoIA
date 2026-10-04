import { Composition } from 'remotion';
import { DemoCU1, DURACION_TOTAL } from './DemoCU1';

export const RemotionRoot: React.FC = () => (
  <Composition id="DemoCU1" component={DemoCU1} durationInFrames={DURACION_TOTAL} fps={30} width={1920} height={1080} />
);
