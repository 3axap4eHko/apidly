export default () => {
  const event: any = jest.fn();
  event.on = jest.fn();

  return event;
}
