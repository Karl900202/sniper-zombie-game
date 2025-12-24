Sniper Zombie Game

Next.js App Router 환경에서 React의 렌더링 모델과 성능 특성을 고려해 구현한 타이밍 기반 미니 게임 프로젝트입니다.

게임 루프는 requestAnimationFrame과 deltaTime 기반 로직으로 구성해 프레임률에 독립적인 계산을 수행하며,
애니메이션은 DOM 레벨에서 60FPS로 처리하고,
React state 기반 UI 업데이트는 30FPS로 제한하여 렌더링 비용을 절반 수준으로 줄였습니다.

이를 위해 총알의 실제 위치 계산은 매 프레임 useRef에 저장하고,
transform: translateX를 통해 DOM에 직접 반영하여 부드러운 60FPS 애니메이션을 유지했습니다.
반면, React state는 33ms 단위로만 업데이트하여 점수, 거리, 상태 표시 등 UI 렌더링 책임만 수행하도록 분리했습니다.

DOM ref를 통한 직접 애니메이션 제어는 성능상 유리하지만,
상태 기반 렌더링을 깨는 리액트 안티 패턴이 될 수 있음을 인지하고 있었으며,
애니메이션 영역으로 책임을 명확히 한정하여 제한적으로 사용했습니다.

또한 Next.js 서버 렌더링 환경에서 발생할 수 있는 hydration mismatch를 방지하기 위해,
랜덤 요소는 렌더 단계가 아닌 useEffect 이후에 초기화하여
서버와 클라이언트가 동일한 초기 HTML을 기준으로 하이드레이션되도록 설계했습니다.

게임 흐름은 ready → starting → playing → success / failed 형태의
명확한 상태 머신으로 관리하여 UI와 로직이 일관되게 동작하도록 구성했습니다.

시각적 재미를 위해서 react-spring/web 라이브러리를 사용해서 정확도 텍스트를 추가했습니다.
