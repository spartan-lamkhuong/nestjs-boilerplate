import { Readable } from 'stream';

interface StreamMany {
  batchSize?: number;
  findMany(batchSize: number, cursorId: number): Promise<any[]>;
}

export const streamMany = async (props: StreamMany): Promise<Readable> => {
  const { batchSize = 3, findMany } = props;
  let cursorId: number = undefined;

  return new Readable({
    objectMode: true,
    highWaterMark: batchSize,
    async read() {
      try {
        const entities = await findMany(batchSize, cursorId);

        for (const userDevice of entities) {
          this.push(userDevice);
        }

        if (entities.length < batchSize) {
          this.push(null);
          return;
        }
        cursorId = entities[entities.length - 1].id;
      } catch (err) {
        this.destroy(err);
      }
    },
  });
};
