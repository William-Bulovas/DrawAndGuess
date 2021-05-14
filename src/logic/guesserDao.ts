import * as tf from '@tensorflow/tfjs';
import { Canvas, Image } from 'canvas';
import {topics} from './drawTopics';

const formatData = (buffer: Uint8ClampedArray) => {
    const output = [];

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
    private model?: tf.LayersModel;

    constructor(
    ) {}

    async loadModel(model: Promise<tf.LayersModel>) {
        if (!this.model) {
            this.model = await model;
        }
    }

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
