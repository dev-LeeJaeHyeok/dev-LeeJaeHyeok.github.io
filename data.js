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
      img: "assets/img/project/nextgen-messaging-platform/arch-legacy.png",
      placeholder: "레거시 아키텍처 다이어그램",
      caption: "해당 서비스는 고객사측 DB에 저장된 row를 polling 방식으로 읽어 서버로 전송한 뒤, 최종적으로 이통망 측에 전달하여 휴대폰 단말기에 문자를 전송하는 서비스입니다." +
          " 하지만 운영과 유지보수 측면에서 문제들을 마주하게됩니다."
    },

    problems: [
        {
            h: "기술 스택의 파편화",
            p: "언어, 프레임워크, 배포, 장애 대응이 서비스마다 달라, 공통 기능 하나를 추가해도 서비스별로 따로 분석, 개발, 검증해야 했으며, 각 서비스에 기능에는 필요한 서버가 제각각이어서 증설 시 IDC에 다수의 서버가 투입되어야했습니다."
        },
        {
            h: "과도한 운영 리소스 비용",
            p: "회사에서는 고객들에게 보다 쉽고 편리하게 서비스를 제공하기위해 Agent를 제공했지만, 고객사마다 환경이 다르고 그에따라 Agent 커스터마이징이 요구되었으며, 엔지니어가 없는 고객사가 증가함에따라 원격 및 현장지원하는 업무가 많아졌고, 고객사당 설치된 N개의 Agent를 운영인력이 전부 관리하기에는 비효율적이었습니다."
        },
        {
            h:"연동 구조의 문제",
            p:"고객사 클라이언트가 TCP/IP로 특정 서버에 직접 연결되는 구조였습니다. 서버를 증설하거나 이관하려면 고객사마다 일정을 잡고 클라이언트 설정을 바꿔야 했고, 세션이 모놀리식 서버에 묶여 있어 해당 서버 작업 시 연결되어져 있는 고객사한테 안내 및 조치를 해야하는 상황이었습니다."
        },
        {
            h:"간편한 외부 인터페이스의 부재",
            p:"기존 Agent가 서버와 소통하는 방식으로 API를 지원했지만, 다소 난이도가 있기에 수요가 없던 상황이었습니다. 하지만 해당 서비스 시장의 경쟁력중 하나인 간편한 외부 인터페이스를 통한 고객의 접근성을 확보하는게 목표였고 이 목표를 기반으로 기존에 있던 레거시의 문제점을 보완한 새로운 플랫폼을 설계하게됩니다."
        }
    ],

    tobe: {
      img: "assets/img/project/nextgen-messaging-platform/arch-nextgen.png",
      placeholder: "차세대 아키텍처 다이어그램<br>assets/img/arch-nextgen.svg",
      caption: "기술 스택을 통합하고, 서비스 요청 입구를 하나의 도메인으로 묶어 각각의 엔드포인트로 서비스를 호출하는 마이크로서비스 아키텍처입니다."
    },

    solution_test: {
      img: "assets/img/project/nextgen-messaging-platform/solution_1_1.png",
      placeholder: "차세대 아키텍처 다이어그램<br>assets/img/arch-nextgen.svg",
      caption: "Spring Cloud는 Service Discovery 기능을 제공합니다. MSA의 각 서비스 인스턴스들은 자신의 위치와 정보를 Spring Cloud의 핵심 서버인 Eureka Server 서버에 등록하여, 서비스 이름을 기준으로 관련 인스턴스의 정보들을 얻을 수 있습니다. 이 메커니즘을 기반으로 Spring Cloud API Gateway에서는 Eureka Server로부터 해당 정보를 가져와서 Spring Cloud Loadbalancer를 통해 요청을 분산하여 각각의 서비스에 맞게 분산되고, 이를 통해서 본 플랫폼은 레거시때와는 다르게 클라이언트에 영향없이 무중단으로 Scale-Out이 가능하게됩니다."
    },

    /* 각 솔루션 = 블록 배열.
       블록 하나 = { h: 부부제목, img: 이미지, p: 설명, layout: 배치 }

       · 적어 둔 키 순서가 곧 화면 순서다.  { img, p } 면 이미지 → 글
       · 같은 종류를 여러 번 쓰려면 뒤에 숫자를 붙이거나 배열로 준다
           { img:"a.png", p:"A", img2:"b.png", p2:"B" }
           { p:["문단1","문단2"] }
       · layout — 없으면 세로로 꽉, "split" 반반, "split-sm" 이미지 작게, "split-lg" 이미지 크게
       · 제목(h)은 layout과 무관하게 항상 한 줄을 다 쓴다 */
    solutions: [
      {
        for: "시스템 통합과 MSA 전환",
        blocks: [
            {
                h: "마이크로서비스 아키텍처로 전환",
                p: "자사의 문자 전송 서비스를 제공하기위해서는 생각보다 많은 절차가 들어갑니다.\n" +
                   "광고 문자에 대해 수신자를 검증하거나 광고 문자 규격에 맞는지 전문을 검토하는 과정, 고객 데이터와 문자 유형에따라 어떤 외부망 경로로 나가는지 결정짓는 라우팅, KISA에서 제공하는 다양한 형태의 스팸 문구인 비정형 데이터를 수집하여 전문 검증시 수천개의 데이터를 본문에서 검출해야합니다.\n" +
                   "이 밖에도 비즈니스 문제를 해결하기위한 다양한 절차가 있으며, 이 절차는 서버를 나누는 기준이되어 변경사항이 발생할 때 해당 범위만 수정되면서 서비스에는 지장이 없도록 하기위해 Spring 생태계에서도 강력한 도구인 Spring Cloud를 이용한 MSA를 선택하게됩니다.",
                img: {
                    src: "assets/img/project/nextgen-messaging-platform/solution_1_1.png",
                    layout: null
                },

                h2: "Spring Cloud 적용기",
                p2: {
                    text: "\n\n\n\nSpring Cloud는 Service Discovery 기능을 제공합니다.\n\n" +
                        "[Step 1]에서 분류된 각 서비스 인스턴스들은 Eureka Client로써 기동할 때 자신의 위치와 정보를 Spring Cloud의 핵심 서버인 Eureka Server에 등록합니다. \n이에따라 Eureka Server는 플랫폼 내부의 서비스 인스턴스들의 정보를 관리할 수 있게됩니다.",
                    layout: "split-sm"
                },
                img2: "assets/img/project/nextgen-messaging-platform/solution_1_2.png",

                img3: {
                    src: "assets/img/project/nextgen-messaging-platform/solution_1_3.png",
                    layout: "split-sm"
                },
                p3: "\n\n\n이 메커니즘을 기반으로 Spring Cloud API Gateway에서는 Eureka Server로부터 해당 정보를 가져와서 Spring Cloud Loadbalancer를 통해 요청을 분산하여 각각의 서비스에 맞게 분산되고, 이를 통해서 본 플랫폼은 레거시때와는 다르게 클라이언트에 영향없이 무중단으로 Scale-Out이 가능하게됩니다. \n 그 밖에도 Config Server를 통해서 수 많은 서비스 인스턴스들의 공통 설정 파일들을 중앙관리화할 수 있습니다.",

                h4: "Spring Cloud API Gateway",
                p4: "플랫폼의 가장 중요한 서버중 하나인 API Gateway는 클라이언트의 요청을 처음으로 받아 요청에 맞는 내부 서비스로 전달하는 서버입니다. "
            },
            {
                h: "Spring Cloud 적용기",
                p: "\n\n\n\nSpring Cloud는 Service Discovery 기능을 제공합니다.\n\n" +
                    "[Step 1]에서 분류된 각 서비스 인스턴스들은 Eureka Client로써 기동할 때 자신의 위치와 정보를 Spring Cloud의 핵심 서버인 Eureka Server에 등록합니다. \n이에따라 Eureka Server는 플랫폼 내부의 서비스 인스턴스들의 정보를 관리할 수 있게됩니다.",
                img: {
                    src: "assets/img/project/nextgen-messaging-platform/solution_1_2.png",
                    layout: "split-sm"
                },


                p2: "\n\n\n이 메커니즘을 기반으로 Spring Cloud API Gateway에서는 Eureka Server로부터 해당 정보를 가져와서 Spring Cloud Loadbalancer를 통해 요청을 분산하여 각각의 서비스에 맞게 분산되고, 이를 통해서 본 플랫폼은 레거시때와는 다르게 클라이언트에 영향없이 무중단으로 Scale-Out이 가능하게됩니다. \n 그 밖에도 Config Server를 통해서 수 많은 서비스 인스턴스들의 공통 설정 파일들을 중앙관리화할 수 있습니다.",
                img2: {
                    src: "assets/img/project/nextgen-messaging-platform/solution_1_3.png",
                    layout: "split-sm",
                },
                h3: "Spring Cloud API Gateway",
                p3: "플랫폼의 가장 중요한 서버중 하나인 API Gateway는 클라이언트의 요청을 처음으로 받아 요청에 맞는 내부 서비스로 전달하는 서버입니다. "
            },
            {
                h: "Spring Cloud API Gateway",
                p: "플랫폼의 가장 중요한 서버중 하나인 API Gateway는 클라이언트의 요청을 처음으로 받아 요청에 맞는 내부 서비스로 전달하는 서버입니다. "
            }
        ]
      },
      {
        for: "과도한 운영 리소스 비용",
        blocks: [
          {
            h: "API Gateway를 단일 진입점으로",
            p: "고객사가 서버 주소를 알고 있는 한 결합은 사라지지 않습니다. 진입점을 하나의 도메인으로 고정하고, 프로토콜도 TCP 영속 세션에서 HTTP로 바꿨습니다. 뒤쪽 인스턴스가 늘거나 바뀌어도 고객사는 아무것도 몰라도 됩니다."
          }
        ]
      },
      {
        for: "처리량 변경의 결합",
        blocks: [
          {
            h: "TPS 정책을 코드 밖으로",
            p: "정책은 운영 중에 바뀌는 값인데 배포 주기에 묶여 있었습니다. Gateway 필터와 Redis로 옮겨 재기동 없이 즉시 반영되도록 했습니다."
          }
        ]
      },
      {
        for: "운영 부담과 자원 누적",
        blocks: [
          {
            h: "탐색·설정·관측을 중앙으로",
            p: "인스턴스가 늘어난 만큼 관리 지점도 늘어나면 확장한 의미가 없습니다. 어디에 무엇이 떠 있는지를 사람이 아니라 시스템이 알게 했습니다."
          }
        ]
      },
      {
        for: "서비스 간 결합",
        blocks: [
          {
            h: "RabbitMQ 기반 비동기 이벤트 파이프라인",
            p: "접수와 발송이 같은 호출 흐름에 묶여 있으면 한쪽이 느려질 때 다른 쪽도 함께 멈춥니다. 이벤트로 끊어 각자의 속도로 처리되게 했습니다."
          }
        ]
      },
      {
        for: "동기식 I/O의 스레드 점유",
        blocks: [
          {
            h: "Non-Blocking 파이프라인으로 동시성 모델 교체",
            p: "장애 대응이 아니라 워크로드에 맞춘 선택이었습니다. 한 건 처리에 외부 I/O가 여러 번 필요한 구조라 대기 시간에 스레드를 붙잡아 두지 않는 모델이 맞다고 봤습니다. 다만 느낌으로 정하지 않고, 같은 조건에서 두 모델을 직접 재본 뒤 결정했습니다."
          }
        ]
      }
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
