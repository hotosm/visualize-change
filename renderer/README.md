## Testing rendering locally:

```sh
$ yarn test:local-render '{ "lat": -8.343, "lng": 115.507, "startDate": "2017-09-01", "endDate": "2017-11-30" }'
```

The JSON above should have the same shape as messages send through rabbitmq queue.

The render config JSON is work in progress and can change.
