"use client";

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { FaSpinner } from "react-icons/fa";
import { z } from "zod";

const contactSchema = z.object({
  user_name: z.string().min(1, "Nome é obrigatório"),
  user_email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
});

type ContactForm = z.infer<typeof contactSchema>;

const ContactSection = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<ContactForm>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    // Coleta manual dos dados
    const formData = new FormData(formRef.current);
    const data: ContactForm = {
      user_name: formData.get("user_name") as string,
      user_email: formData.get("user_email") as string,
      message: formData.get("message") as string,
    };

    // Validação com Zod
    const result = contactSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setValidationErrors({
        user_name: fieldErrors.user_name?.[0],
        user_email: fieldErrors.user_email?.[0],
        message: fieldErrors.message?.[0],
      });
      return;
    }

    setIsSending(true);
    setValidationErrors({});
    setSuccess(false);
    setError(false);

    emailjs
      .sendForm(
        "service_qfvelpq",
        "template_ugno9dd",
        formRef.current,
        "dGxpS9FeujlUDKTae"
      )
      .then(
        () => {
          setIsSending(false);
          setSuccess(true);
          formRef.current?.reset();
        },
        () => {
          setIsSending(false);
          setError(true);
        }
      );
  };

  return (
    <section id="contact" className="py-20 px-6 bg-white">
      <div className="max-w-xl mx-auto text-center">
        <h3 className="text-3xl font-bold text-green mb-6">Entre em contato!</h3>
        <p className="text-gray-700 mb-6">
          Preencha o formulário abaixo e entraremos em contato com você para apresentar o Smart Seed.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <input
              type="text"
              name="user_name"
              placeholder="Nome"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            {validationErrors.user_name && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.user_name}</p>
            )}
          </div>
          <div>
            <input
              type="email"
              name="user_email"
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            {validationErrors.user_email && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.user_email}</p>
            )}
          </div>
          <div>
            <textarea
              name="message"
              placeholder="Mensagem"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            {validationErrors.message && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="w-full p-3 bg-green text-white rounded-lg hover:bg-green/90 transition disabled:opacity-50 items-center flex justify-center"
          >
            {isSending ? <FaSpinner className="animate-spin" /> : "Enviar mensagem"}
          </button>
        </form>

        {success && (
          <p className="text-green mt-4">Mensagem enviada com sucesso!</p>
        )}
        {error && (
          <p className="text-red mt-4">
            Ocorreu um erro. Tente novamente mais tarde.
          </p>
        )}
      </div>
    </section>
  );
};

export default ContactSection;
