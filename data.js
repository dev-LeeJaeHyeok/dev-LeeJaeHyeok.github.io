/* ============================================================
   콘텐츠 데이터 — 이 파일만 수정하면 내용이 바뀝니다.
   ============================================================ */

const PROJECTS = {

  proj1: {
    eyebrow: "CASE STUDY 01",
    title: "차세대 통합 메시징 플랫폼",
    meta: [
      ["기간", "2023.04 — 2025.06"],
      ["역할", "5인 개발팀 PL · 아키텍처 설계 · 개발 리드 · 성능/장애 검증 · 운영 전환"],
      ["기술", "Java 17 · Spring Boot 3.x · WebFlux · Spring Cloud · R2DBC · MariaDB · Redis · RabbitMQ"]
    ],
    summary: "고객사별 Agent와 서비스별 레거시 Gateway에 분산돼 있던 메시지 처리 구조를, 하나의 REST API로 SMS·MMS/LMS·알림톡·RCS를 이용하도록 재설계한 플랫폼 통합 프로젝트입니다.",

    asis: {
      // 이미지 넣기: img: "assets/img/arch-legacy.svg"
      img: null,
      placeholder: "레거시 아키텍처 다이어그램<br>assets/img/arch-legacy.svg",
      caption: "하나의 플랫폼이지만 SMS는 C 기반 분산(Active-Active), MMS/LMS·알림톡은 JDK 1.5 자체 프레임워크 모놀리식, RCS는 JDK 11 Vert.x로 실행 구조가 네 갈래로 나뉘어 있었습니다."
    },

    problems: [
      {
        h: "변경 증폭",
        p: "언어·프레임워크·배포·장애 대응이 서비스마다 달라, 공통 기능 하나를 추가해도 서비스별로 따로 분석·개발·검증해야 했습니다."
      },
      {
        h: "운영 결합",
        p: "고객사 Agent가 특정 서버에 직접 결합돼 있어, 서버 증설·교체가 고객사 방화벽 변경이나 설정 변경·재기동 작업으로 전파됐습니다."
      },
      {
        h: "고객사별 자원 누적",
        p: "REST API 제공형은 고객사마다 전용 테이블과 Agent JVM이 같은 하드웨어에 쌓이는 구조여서, 고객이 늘면 프로세스가 함께 늘었습니다. 실제 장애로 이어지진 않았지만 확장을 가로막는 구조적 위험이었습니다."
      },
      {
        h: "처리량 변경의 결합",
        p: "TPS를 조정하려면 인증코드 추가와 Agent 재기동이 필요해, 그 사이 발송이 일시 중단됐습니다."
      }
    ],

    tobe: {
      img: null,
      placeholder: "차세대 아키텍처 다이어그램<br>assets/img/arch-nextgen.svg",
      caption: "부분 개선 대신 정책과 책임을 중심으로 공통 플랫폼을 재구성해, 고객 수와 처리 서버 수가 서로 독립적으로 확장되도록 했습니다."
    },

    solutions: [
      ["변경 증폭", "모든 서비스를 Spring 생태계로 통합하고 Eureka·Config Server로 탐색과 설정을 중앙화. 공통 기능을 한 번만 구현합니다."],
      ["운영 결합", "고객사는 단일 REST API와 Client Key/JWT로 연동. 전용 테이블 없이 처리 서버를 독립적으로 Scale-Out합니다."],
      ["자원 누적", "첨부 파일을 Storage Server로 분리해 API 서버와 발송 프로세스의 물리적 결합을 해소했습니다."],
      ["처리량 결합", "API Gateway의 RedisRateLimiter(Token Bucket)로 TPS 정책을 분리. 재기동 없이 즉시 반영됩니다."],
      ["동시 I/O 처리", "WebFlux Non-Blocking 파이프라인 도입. 장애 대응이 아니라, 다수의 외부 I/O를 적은 스레드로 처리하기 위한 동시성 모델 선택입니다."]
    ],

    impl: [
      "API Gateway", "Message Server", "Router", "DB Logger", "Reporter",
      "Retry Reporter", "Storage Server", "OAuth 인증 서버", "Config Server", "Eureka"
    ],

    tests: [
      {
        name: "① API Gateway 고객별 TPS 제어",
        cond: "12 Client · 100–1,500 TPS 설정 · k6",
        nums: [["p95 < 100ms", "목표 응답속도 달성"], ["12", "Client별 TPS 제어"], ["1,500", "최대 설정 TPS"]]
      },
      {
        name: "② MVC vs WebFlux 처리 모델 벤치마크",
        cond: "별도 벤치마크 · 4C/8T · Connection Pool 100 · Req→Redis→DB→Res",
        nums: [["118→27", "Peak Thread 수"], ["6.3×", "평균 응답 127→20ms"], ["46→36%", "CPU 사용률"]]
      },
      {
        name: "③ 메시지 접수 API 부하 테스트",
        cond: "8C/16T · 32GB · 3,500 TPS 10분 고정 — 접수 성능이며 최종 발송량이 아닙니다",
        nums: [["3,500", "TPS 안정 처리"], ["~50ms", "p95 응답"], ["0%", "오류율"]]
      }
    ],

    result: "Agent 설치 없이 REST API로 연동할 수 있게 됐고, TPS 정책을 무중단으로 변경하며 고객사에 최대 1,500 TPS를 제공합니다. Sender 장애 시 Queue 메시지를 정상 Sender로 이관하는 시나리오도 검증했습니다."
  },

  proj2: {
    eyebrow: "CASE STUDY 02",
    title: "농협정보시스템 RCS 전송 서버",
    meta: [
      ["기간", "2022.01 — 2023.03"],
      ["역할", "서버 개발 · 프로토콜 구현 · 장애 복구 설계 · 운영 모니터링"],
      ["기술", "Java 11 · Spring Boot 2.x · Netty · RabbitMQ · Redis · MariaDB · Prometheus · Grafana"]
    ],
    summary: "농협정보시스템과 RCS Gateway 사이에서 발송 요청 수신, Gateway 전송, 결과 리포트 회신을 처리하는 연동 서버입니다. 기존 C 기반 RCV/RPT 프로세스를 Java·Netty 기반으로 재구현했습니다.",

    asis: {
      img: null,
      placeholder: "RCS 연동 구조 다이어그램<br>assets/img/arch-rcs.svg",
      caption: "사전 정의된 RCV 120개, RPT 120개 TCP 세션을 통해 전문 기반으로 통신하며, 최대 1,000 TPS 부하 조건에서 리포트 3초 이내 처리 요구사항을 만족해야 했습니다."
    },

    problems: [
      {
        h: "중복 접수 가능성",
        p: "고객사 또는 내부 서버의 재전송으로 동일 메시지 Key가 중복 접수될 수 있어, 같은 메시지가 두 번 발송될 위험이 있었습니다."
      },
      {
        h: "리포트 유실 위험",
        p: "Gateway 전송이 실패하거나 프로세스가 비정상 종료되면, 고객사가 발송 결과를 영영 받지 못하는 구간이 생길 수 있었습니다."
      },
      {
        h: "검증 실패 시 원인 불명",
        p: "전문 데이터가 규격에 맞지 않을 때 어떤 필드가 잘못됐는지 고객사가 알 수 없으면, 장애 원인 파악에 시간이 걸립니다."
      }
    ],

    tobe: null,

    solutions: [
      ["중복 접수", "Redis TTL 기반 messageKey 검사로 중복 발송을 차단. 만료 시간은 메시지 옵션별로 다르게 설정했습니다."],
      ["리포트 유실", "농협 측 수신 확인 응답을 받은 경우에만 RabbitMQ ACK 처리. 서버 장애 시 미전달 리포트가 Queue에서 재처리됩니다."],
      ["실시간 회신 실패", "실패 건을 MariaDB에 저장하고, 고객사가 messageKey로 조회 요청하면 TCP 전문으로 재응답합니다."],
      ["원인 불명", "인코딩·길이·필수값·형식·코드값을 검증하고, 실패 시 어떤 데이터가 잘못됐는지 응답 전문에 담아 반환합니다."],
      ["복구 기준", "부하 테스트 중 RCV·Sender·RPT를 강제 종료하며 중복·유실을 검증. 상태가 확정되는 시점에만 처리 정보를 갱신하도록 설계했습니다."]
    ],

    impl: [
      "RCV 수신 서버 (Netty)", "RCS Sender", "RPT 리포트 서버",
      "TCP 테스트 클라이언트", "Redis 매핑 처리", "모니터링 대시보드"
    ],

    tests: [
      {
        name: "① 부하 및 요구사항 검증",
        cond: "최대 1,000 TPS 조건 · 리포트 3초 이내 처리",
        nums: [["1,000", "TPS 부하 조건 충족"], ["3초", "리포트 처리 요건 만족"], ["240", "TCP 세션 동시 운용"]]
      },
      {
        name: "② 장애 상황 유실 방지 테스트",
        cond: "부하 중 RCV·Sender·RPT 프로세스 강제 종료 후 중복·유실 검증",
        nums: [["0건", "중복 발송"], ["0건", "리포트 유실"], ["재기동", "미완료 건 우선 처리"]]
      },
      {
        name: "③ 운영 실적",
        cond: "담당 기간 중 Prometheus·Grafana 모니터링 기준",
        nums: [["400만", "월 발송 건수"], ["0건", "주요 운영 장애"], ["0건", "메모리 누수"]]
      }
    ],

    result: "담당 기간 동안 메모리 누수나 주요 운영 장애 없이 월 약 400만 건의 RCS 발송 트래픽을 안정적으로 처리했습니다."
  },

  proj3: {
    eyebrow: "CASE STUDY 03",
    title: "레거시 문자 플랫폼 개발·운영",
    meta: [
      ["기간", "2021.10 — 2023.09"],
      ["역할", "유지보수 · 서버 리모델링 · 백오피스 도구 개발"],
      ["기술", "Java 8/11 · Spring Boot 2.x · MySQL · Thymeleaf · Apache POI · PDFBox"]
    ],
    summary: "온프레미스 환경의 대량 문자 발송 사이트와 발송 Agent·Gateway를 운영하면서, 실무에 필요한 데이터 수집기와 문서 빌더를 직접 만들어 반복 업무를 줄였습니다.",

    asis: null,

    problems: [
      {
        h: "PDF 수작업 확인",
        p: "운영팀이 매달 100~200개의 PDF 문서를 일일이 열어 데이터를 확인해야 했습니다."
      },
      {
        h: "Excel 보고서 반복 작성",
        p: "유관 부서들이 매일 같은 형식의 업무 보고용 Excel을 손으로 작성하고 있었습니다."
      },
      {
        h: "C 기반 수신 서버의 유지보수",
        p: "010→015 번호로 들어오는 문자를 수신하는 서버가 C로 작성돼 있어, 확장성과 유지보수성이 떨어졌습니다."
      }
    ],

    tobe: null,

    solutions: [
      ["PDF 수작업", "Apache PDFBox 기반 데이터 추출기를 개발해 특정 데이터를 자동 추출. 확인 절차가 크게 줄었습니다."],
      ["보고서 작성", "Apache POI 기반 Excel 빌더 제작. 양식을 등록하고 템플릿 문법으로 데이터를 채우도록 Thymeleaf UI를 제공했습니다."],
      ["레거시 수신 서버", "C로 작성된 015 수신 서버를 분석해 Java 11 버전으로 리모델링했습니다."],
      ["국제 MMS 발송", "해외 발송사 서버와 SMPP 규격으로 통신하는 클라이언트 모듈을 개발했습니다."],
      ["플랫폼 이관", "LG CNS 전용 Agent의 DB I/O를 Oracle에서 MySQL로 마이그레이션하고 설치·테스트를 지원했습니다."]
    ],

    impl: [
      "PDF 데이터 추출기", "Excel 문서 빌더", "015 수신 서버 (Java 리모델링)",
      "SMPP 클라이언트 모듈", "문자 발송 Agent 유지보수"
    ],

    tests: [
      {
        name: "업무 프로세스 개선 결과",
        cond: "자체 제작 도구 도입 전후 비교",
        nums: [["100+", "월 PDF 수작업 자동화"], ["2종", "사내 도구 자체 제작"], ["C→Java", "수신 서버 리모델링"]]
      }
    ],

    result: "운영팀과 유관 부서의 반복 수작업을 도구로 대체해 업무 프로세스를 개선했고, 레거시 C 서버를 Java 기반으로 옮겨 유지보수성을 높였습니다."
  }
};


const SKILLS = {
  java: {
    name: "Java",
    period: "실무 4년",
    body: "객체지향 설계와 SOLID 원칙을 이해하고, 요구사항을 명확히 분석한 뒤 설계하고 코드를 작성합니다. 주석 없이 의도가 드러나는 코드를 지향하며, JUnit 5·AssertJ·Mockito를 주력으로 검증된 코드를 만듭니다. 멀티스레드 환경의 동시성 이슈를 이해하고 상황에 맞게 대응할 수 있습니다."
  },
  spring: {
    name: "Spring Boot",
    period: "실무 4년",
    body: "Spring 생태계 기반 웹 서비스 개발에 능숙합니다. 계층 간 모듈의 역할과 책임을 명확히 나누는 것을 지향하며, 차세대 플랫폼에서는 Spring Boot 3.x 기반으로 Gateway·Message·Router·Reporter 등 다수의 서비스를 설계·구현했습니다."
  },
  webflux: {
    name: "Spring WebFlux",
    period: "차세대 플랫폼 도입·운영",
    body: "초당 수천 건의 호출 환경에서 외부 API·Redis·DB·RabbitMQ 연계로 발생하는 I/O 대기가 요청 스레드를 점유하는 구조를 개선하기 위해 Non-Blocking 파이프라인을 도입했습니다. Context API로 리액티브 체인의 에러를 추적하는 공통 함수를 작성해 디버깅 효율을 높였습니다."
  },
  netty: {
    name: "Netty",
    period: "RCS 연동 서버 구축",
    body: "농협정보시스템 연동 서버에서 TCP 기반 전문 수신 서버를 구성했습니다. Header 지정 길이와 정의된 데이터 길이를 기준으로 전문을 파싱하고, 인코딩·길이·필수값·형식·코드값 검증 로직을 구현했습니다."
  },
  mariadb: {
    name: "MariaDB",
    period: "실무 4년",
    body: "차세대 플랫폼의 DB 설계를 담당했습니다. 도메인과 데이터 모델을 명확히 이해해 확장성과 유지보수성을 고려한 설계를 하고, Query Explain으로 쿼리 수행 흐름을 분석해 성능을 검증·최적화할 수 있습니다."
  },
  postgres: {
    name: "PostgreSQL",
    period: "업무 환경 사용",
    body: "PostgreSQL 업무 환경에 익숙하며, RDB 설계와 데이터 처리에 능숙합니다."
  },
  redis: {
    name: "Redis",
    period: "실무 3년+",
    body: "자료구조별 특성을 이해하고 데이터 접근 패턴과 정합성을 고려한 캐싱 전략을 설계합니다. RCS 서버에서는 TTL 기반 중복 방지와 리포트 매핑 처리에, 차세대 플랫폼에서는 Gateway의 Token Bucket 기반 TPS 제어에 활용했습니다."
  },
  r2dbc: {
    name: "R2DBC",
    period: "차세대 플랫폼 적용",
    body: "메시지 처리 이력을 관리하는 DB Logger를 R2DBC 기반으로 개발해, 비동기 파이프라인에서 DB I/O가 스레드를 점유하지 않도록 구성했습니다."
  },
  rabbitmq: {
    name: "RabbitMQ",
    period: "실무 3년+",
    body: "Topic Exchange로 이벤트를 여러 서버에 전파하고, DLX/DLQ 설정으로 정상·실패·재시도 이벤트를 분리해 병목을 방지했습니다. 고가용성과 노드 간 지연 최소화를 위해 LAN 환경에 클러스터를 구축했습니다. Publisher Confirm ACK 기준으로 접수 성공/실패를 제어합니다."
  },
  cloud: {
    name: "Spring Cloud",
    period: "차세대 플랫폼 구축",
    body: "API Gateway에 RedisRateLimiter 기반 트래픽 제어 필터를 구현하고, Eureka 서비스 디스커버리로 무중단 Scale-Out을 구성했습니다. Circuit Breaker로 Fail-Fast를 도입하고, Config Server로 서버별 흩어진 설정을 중앙 관리해 환경별 불일치를 해소했습니다."
  },
  docker: {
    name: "Docker",
    period: "온프레미스 CI/CD 구축",
    body: "배포 환경을 컨테이너로 통합하고 GitHub Actions 파이프라인에 연동했습니다. Shell Script와 함께 로그 관리, 파일 백업, 컨테이너 실행 환경 구성 등 반복적인 운영 작업을 개선했습니다."
  },
  actions: {
    name: "GitHub Actions",
    period: "온프레미스 환경 구축",
    body: "온프레미스 환경에서 빌드·테스트·배포 과정을 Workflow로 작성해 CI/CD 파이프라인을 구축했습니다. Git Flow 기반 브랜치 전략으로 버전 관리 라이프사이클을 관리합니다."
  },
  prometheus: {
    name: "Prometheus",
    period: "실무 3년+",
    body: "백엔드 서비스와 연동해 Metrics를 수집하고, Alertmanager로 임계치 알람을 구성했습니다. 장애 발생 시 담당자에게 Slack 알림이 가도록 알람 발생과 전파를 분리했습니다."
  },
  grafana: {
    name: "Grafana",
    period: "실무 3년+",
    body: "서비스별 트래픽, MSA 구성 서버의 리소스 사용량, JVM, 요청 수, 응답 시간, 오류율을 한 대시보드에서 확인하도록 구성했습니다. RCS 서버에서는 TCP 세션 상태와 Queue 상태까지 모니터링했습니다."
  },
  k6: {
    name: "k6",
    period: "성능 검증 도구",
    body: "차세대 플랫폼의 성능 검증에 사용했습니다. 12개 클라이언트별 TPS 설정 부하 테스트, MVC와 WebFlux 처리 모델 비교 벤치마크, 접수 API의 3,500 TPS 고정 부하 테스트를 설계하고 수행했습니다."
  }
};
