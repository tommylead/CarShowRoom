'use client';

import { FaCar, FaTools, FaUserShield, FaMoneyBillWave } from 'react-icons/fa';

const features = [
  {
    name: 'Xe chất lượng cao',
    description: 'Tất cả xe đều được kiểm tra kỹ lưỡng và đảm bảo chất lượng trước khi bán.',
    icon: FaCar,
  },
  {
    name: 'Bảo hành toàn diện',
    description: 'Chế độ bảo hành và bảo dưỡng chuyên nghiệp từ đội ngũ kỹ thuật viên có tay nghề cao.',
    icon: FaTools,
  },
  {
    name: 'An toàn & Uy tín',
    description: 'Cam kết minh bạch thông tin và bảo vệ quyền lợi khách hàng.',
    icon: FaUserShield,
  },
  {
    name: 'Giá cả hợp lý',
    description: 'Mức giá cạnh tranh với nhiều chương trình ưu đãi và hỗ trợ tài chính.',
    icon: FaMoneyBillWave,
  },
];

export default function Features() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center animate-fade-in-left">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Ưu điểm</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Tại sao chọn chúng tôi?
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm mua xe tốt nhất cho khách hàng với những ưu điểm vượt trội.
          </p>
        </div>

        <div className="mt-20">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className="relative animate-fade-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
} 