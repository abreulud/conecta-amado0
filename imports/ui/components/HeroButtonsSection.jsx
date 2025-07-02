import React from 'react';
import { Link } from 'react-router-dom';

export const HeroButtonsSection = () => {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto text-left">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 ">
          Um espaço seguro para cuidar de você, exatamente como você é
        </h2>
        <p className="text-lg text-gray-700 mb-10">
          Na Conecta Amado, oferecemos serviços especializados de saúde e apoio
          psicossocial para a comunidade LGBTQIA+. Aqui, você encontra
          acolhimento, respeito e profissionais qualificados para atender suas
          necessidades com sensibilidade e expertise.
        </p>
        <div className="flex gap-4">
          <Link
            to="/book"
            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
          >
            Agendar
          </Link>
          <Link
            to="/services"
            className="border border-black text-black px-6 py-3 rounded-full hover:bg-black hover:text-white transition"
          >
            Ver serviços
          </Link>
        </div>
      </div>
    </section>
  );
};
