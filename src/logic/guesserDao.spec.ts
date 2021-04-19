// import type * as tf from '@tensorflow/tfjs';
import type { GuesserDao } from './guesserDao';

jest.mock('@tensorflow/tfjs');

// let mockModel: tf.LayersModel;

let dao: GuesserDao;

beforeEach(() => {
    // mockModel = new tf.LayersModel();
    // dao = new GuesserDao(mockModel);
});

it('placeholder', () => {});