import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "배송·교환·환불 정책",
};

export default function ShippingRefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <p className="mb-3 text-xs font-semibold tracking-wide text-patina uppercase">Policy</p>
      <h1 className="mb-2 font-display text-2xl">배송·교환·환불 정책</h1>
      <p className="mb-12 text-xs text-ink-faint">
        본 페이지는 실물 상품(작품, 아트 굿즈, 커미션)의 배송·교환·반품·환불 기준을 안내합니다.
        상품별 세부 조건은 각 상품 상세페이지 또는 주문 과정에서 별도로 표시된 내용이 우선 적용됩니다.
      </p>

      <div className="space-y-14">
        <PolicySection number="01" title="배송기간">
          <p>
            상품은 원칙적으로 판매자인 입점 작가가 직접 포장하여 발송합니다. 배송기간은 작품 및
            상품마다 다르며, 상품 상세페이지 또는 주문 과정에서 사전에 명시된 기간에 따라 발송됩니다.
          </p>
          <p>
            주문제작(Made-to-order) 상품이나 커미션 작품은 별도의 제작기간이 필요할 수 있으므로,
            주문 전 상품 상세페이지에 안내된 제작·배송기간을 반드시 확인해 주세요.
          </p>
          <p>
            발송이 완료되면 등록된 운송장번호를 통해 배송상태를 조회하실 수 있습니다. 송장 등록 직후에는
            배송정보 조회에 다소 시간이 걸릴 수 있습니다.
          </p>
        </PolicySection>

        <PolicySection number="02" title="배송비 기준">
          <p>
            현재 갤러리 루모라에서 판매되는 모든 작품 및 상품은 <strong className="text-ink font-medium">무료 배송</strong>으로
            제공됩니다.
          </p>
          <p>
            다만 배송비 정책은 작품 및 판매자(입점 작가)에 따라 달라질 수 있으므로, 정확한 배송비는
            상품 상세페이지 또는 결제 화면에서 다시 한 번 확인해 주세요.
          </p>
        </PolicySection>

        <PolicySection number="03" title="교환·반품·환불 절차">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              교환·반품·환불이 필요한 경우 작가에게 직접 연락하지 마시고, 먼저{" "}
              <a href="/commission" className="text-patina hover:underline">
                갤러리 루모라 고객센터
              </a>
              로 접수해 주세요.
            </li>
            <li>고객센터가 접수 내용을 확인한 후 반품주소 및 이후 절차를 안내해 드립니다.</li>
            <li>안내받은 반품주소로 상품을 발송해 주세요. 임의로 작가에게 직접 발송하지 않도록 유의해 주세요.</li>
            <li>반품 상품 확인 후 환불이 진행됩니다.</li>
          </ol>

          <h3 className="mt-6 mb-2 text-sm font-semibold text-ink">청약철회(단순 변심 반품)</h3>
          <p>
            관련 법령이 정하는 범위에서 상품을 공급받은 날부터 <strong className="text-ink font-medium">7일 이내</strong>에는
            단순 변심으로도 청약철회가 가능합니다. 다만 상품의 특성, 훼손 여부, 제작 진행 여부 등에 따라
            청약철회가 제한될 수 있으므로 구매 전 상품 상세페이지의 안내를 확인해 주세요. 단순 변심에 의한
            반품의 경우 반품 배송비는 구매자가 부담합니다.
          </p>

          <h3 className="mt-6 mb-2 text-sm font-semibold text-ink">판매자 귀책사유에 의한 교환·반품</h3>
          <p>다음의 경우에는 판매자(입점 작가)의 귀책사유에 따른 교환·반품이 가능하며, 이 경우 반품 배송비는 판매자가 부담합니다.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>작품이 배송 과정에서 파손된 경우</li>
            <li>주문한 작품과 다른 작품이 배송된 경우</li>
            <li>상품 상세페이지의 내용과 실제 상품이 중대하게 다른 경우</li>
            <li>제작상의 하자가 있는 경우</li>
          </ul>

          <h3 className="mt-6 mb-2 text-sm font-semibold text-ink">환불 시점</h3>
          <p>
            환불이 승인되고 상품 반환이 필요한 경우 해당 상품을 반환받은 날부터{" "}
            <strong className="text-ink font-medium">3영업일 이내</strong>에 환급됩니다. 반환이 필요하지
            않은 경우에는 법령에서 정한 환급기산일로부터 3영업일 이내에 환급됩니다. 결제수단에 따라 실제
            환불 반영 시점은 다를 수 있습니다.
          </p>

          <h3 className="mt-6 mb-2 text-sm font-semibold text-ink">배송 중 파손</h3>
          <p>
            배송 중 작품이 파손된 경우, 상품과 포장 상태를 그대로 보관하시고 가능하다면 파손 상태가
            확인되는 사진을 촬영하신 후 고객센터로 문의해 주세요. 확인 후 판매자와 함께 필요한 절차를
            안내해 드립니다.
          </p>
        </PolicySection>

        <PolicySection number="04" title="커미션(주문제작) 작품의 취소·환불">
          <p>
            커미션은 고객님의 요청에 따라 개별적으로 제작되는 상품이므로, 제작 진행 단계에 따라
            청약철회 및 취소·환불이 제한될 수 있습니다. 단, 단순히 &ldquo;커미션 상품&rdquo;이라는
            명칭만으로 청약철회를 제한하지 않으며, 청약철회를 제한하는 경우 주문 전에 그 사실과 사유를
            명확히 표시하고 별도 동의를 받습니다.
          </p>
          <p>
            작업 착수 전 취소, 작업 착수 후 취소, 시안 제작 이후 취소 등 세부 환불 조건은 커미션 주문
            전 안내되는 내용을 기준으로 하며, 자세한 내용은{" "}
            <a href="/commission" className="text-patina hover:underline">
              고객센터 FAQ &ldquo;커미션&rdquo; 항목
            </a>
            을 확인해 주세요.
          </p>
        </PolicySection>
      </div>

      <p className="mt-16 border-t border-line pt-6 text-xs text-ink-faint">
        본 페이지에 안내되지 않은 사항은 갤러리 루모라 구매자 이용약관(제9조~제11조) 및 1:1 커미션 거래
        특약을 따릅니다. 문의사항은{" "}
        <a href="mailto:Versoi.labs@gmail.com" className="hover:text-ink hover:underline">
          Versoi.labs@gmail.com
        </a>
        으로 연락해 주세요.
      </p>
    </div>
  );
}

function PolicySection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 font-display text-lg">
        <span className="mr-2 text-ink-faint">{number}</span>
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-7 text-ink-soft">{children}</div>
    </section>
  );
}
