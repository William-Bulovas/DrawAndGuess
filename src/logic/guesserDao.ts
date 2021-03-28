import * as tf from '@tensorflow/tfjs-node';
import { canvasSize } from '../model/canvasDimensions';
import {topics} from './drawTopics';

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = Buffer.from(dataURI.split(',')[1]).toString('binary');
  
  }

const formatData = (buffer: Buffer) => {
    const output = [];

    console.log(buffer.length)

    let row = [];
    for (let i = 0; i < canvasSize; i++) {

        row.push([(255 - buffer[i*4])/255])

        if (row.length === 28) {
            output.push(row);

            row = [];
        }
    }

    return [output];
};

export class GuesserDao {
    constructor(
        private model: tf.LayersModel,
    ) {}

    guess(image: string) {
        const buffer = Buffer.from(image.split(',')[1], 'base64');
        const imageTensor = tf.tensor(formatData(buffer));

        const prediction = this.model.predict(imageTensor);
        let topPrediction: tf.Tensor<tf.Rank>;
        if (Array.isArray(prediction)) {
            topPrediction = prediction[0];
        } else {
            topPrediction = prediction;
        }

        const prob = Array.from(topPrediction.dataSync())
            .map((value, index) => ({index, value}))
            .sort((a,b) => b.value - a.value)
            .slice(0, 1)[0];

        Array.from(topPrediction.dataSync())
            .map((value, index) => ({index, value}))
            .sort((a,b) => b.value - a.value)
            .slice(0, 5)
            .forEach(value => {
                console.log(topics[value.index])
            });
        
        return topics[prob.index];
    }
}