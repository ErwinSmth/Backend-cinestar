package pe.edu.utp.cinestar.seat.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "cinestar.topic.exchange";
    public static final String DLX_EXCHANGE = "cinestar.dlx.exchange";

    public static final String WAIT_QUEUE = "seat.wait.queue";
    public static final String RELEASE_QUEUE = "seat.release.queue";
    public static final String PAYMENT_SUCCESS_QUEUE = "payment.success.queue";
    public static final String NOTIFICATION_QUEUE = "ticket.notifications.queue";

    public static final String ROUTING_KEY_WAIT = "seat.wait";
    public static final String ROUTING_KEY_RELEASE = "seat.release";
    public static final String ROUTING_KEY_PAYMENT_SUCCESS = "payment.success";
    public static final String ROUTING_KEY_NOTIFICATION = "ticket.purchased";

    @Bean
    public TopicExchange mainExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public TopicExchange dlxExchange() {
        return new TopicExchange(DLX_EXCHANGE);
    }

    @Bean
    public Queue waitQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", DLX_EXCHANGE);
        args.put("x-dead-letter-routing-key", ROUTING_KEY_RELEASE);
        args.put("x-message-ttl", 300000); // 5 minutes TTL
        return new Queue(WAIT_QUEUE, true, false, false, args);
    }

    @Bean
    public Queue releaseQueue() {
        return new Queue(RELEASE_QUEUE);
    }

    @Bean
    public Queue paymentSuccessQueue() {
        return new Queue(PAYMENT_SUCCESS_QUEUE);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE);
    }

    @Bean
    public Binding bindingWait() {
        return BindingBuilder.bind(waitQueue()).to(mainExchange()).with(ROUTING_KEY_WAIT);
    }

    @Bean
    public Binding bindingRelease() {
        return BindingBuilder.bind(releaseQueue()).to(dlxExchange()).with(ROUTING_KEY_RELEASE);
    }

    @Bean
    public Binding bindingPaymentSuccess() {
        return BindingBuilder.bind(paymentSuccessQueue()).to(mainExchange()).with(ROUTING_KEY_PAYMENT_SUCCESS);
    }

    @Bean
    public Binding bindingNotification() {
        return BindingBuilder.bind(notificationQueue()).to(mainExchange()).with(ROUTING_KEY_NOTIFICATION);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
