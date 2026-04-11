export const routes = [
  {
    path: 'workspace/:sessionId',
    private: true,
    children: [
      {
        path: 'generations/:generationId',
        private: true
      },
      {
        path: 'compositions/:compositionId',
        private: true
      }
    ]
  }
];
