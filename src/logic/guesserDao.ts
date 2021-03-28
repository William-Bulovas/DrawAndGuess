import * as tf from '@tensorflow/tfjs-node';
import { Canvas, Image } from 'canvas';
import PNG from 'png-ts';
import { canvasSize } from '../model/canvasDimensions';
import {topics} from './drawTopics';

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = Buffer.from(dataURI.split(',')[1]).toString('binary');
  
  }

const formatData = (buffer: Uint8ClampedArray) => {
    const output = [];

    console.log(buffer.length)

    let row = [];
    for (let i = 0; i < 784; i++) {
        let data = 0;
        if (buffer[i * 4] + buffer[i * 4 + 1] + buffer[i * 4 + 2]) {
            data = 1;
        }

        row.push([data])

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

    async guess(imageDataURL: string) {
        const canvas = new Canvas(28, 28);
        const context = canvas.getContext('2d');
        const loadPromise = new Promise<void>(resolve => {
            const image = new Image();

            image.onload = () => {
                context.drawImage(image, 0, 0, 28, 28);
                resolve();
            }

            image.src = imageDataURL;
        });

        await Promise.resolve(loadPromise);

        const data = context.getImageData(0,0,28,28);
        console.log('pixel data = ' + data.height);
        console.log('pixel data = ' + data.width);

        const imageTensor = tf.tensor(formatData(data.data));

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